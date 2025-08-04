# sms.py

import serial
import time
import threading
from typing import Callable, Optional

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600

class SMSHandler:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE):
        self.ser = serial.Serial(port, baud, timeout=1)
        self.lock = threading.Lock()
        time.sleep(2)  # Allow GSM module to initialize
        self.callback: Optional[Callable[[dict], None]] = None

    def _send_at_command(self, command: str, expected_response: str = "OK", timeout: float = 2.0) -> str:
        with self.lock:
            self.ser.write((command + "\r").encode())
            response = self._read_response(timeout)
            if expected_response not in response:
                raise IOError(f"Unexpected response to {command}: {response}")
            return response

    def _read_response(self, timeout: float) -> str:
        start_time = time.time()
        response = ""
        while (time.time() - start_time) < timeout:
            if self.ser.in_waiting > 0:
                response += self.ser.read(self.ser.in_waiting).decode(errors="ignore")
        return response

    def send_sms(self, phone_number: str, message: str):
        def text_to_ucs2(text: str):
            return ''.join(f'{ord(c):04X}' for c in text)

        try:
            self._send_at_command("AT")
            self._send_at_command('AT+CSCS="UCS2"')
            self._send_at_command("AT+CMGF=1")
            
            ucs2_number = text_to_ucs2(phone_number)
            self._send_at_command(f'AT+CMGS="{ucs2_number}"', expected_response=">")
            
            with self.lock:
                self.ser.write(text_to_ucs2(message).encode() + b"\x1A")
                response = self._read_response(10) # Increased timeout for sending
                if "OK" not in response:
                    raise IOError(f"Failed to send SMS. Response: {response}")

            return {"status": "sent", "to": phone_number, "message": message}
        except Exception as e:
            # You could add a retry mechanism here if desired
            raise e

    def read_sms(self):
        with self.lock:
            self._send_at_command("AT", "OK")
            self._send_at_command("AT+CMGF=1", "OK")
            self.ser.write(b'AT+CMGL="REC UNREAD"\r')
            time.sleep(1)
            raw_data = self.ser.read(self.ser.in_waiting or 1).decode(errors="ignore")
        
        return self._parse_sms(raw_data)

    def _parse_sms(self, raw: str):
        messages = []
        lines = raw.splitlines()
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith("+CMGL:"):
                parts = line.split(",")
                raw_phone = parts[2].strip('"')
                timestamp = parts[4].strip('"')
                raw_content = lines[i + 1].strip() if i + 1 < len(lines) else ""
                try:
                    phone = bytes.fromhex(raw_phone).decode("utf-16-be")
                    content = bytes.fromhex(raw_content).decode("utf-16-be")
                except (ValueError, IndexError):
                    phone = raw_phone
                    content = raw_content

                msg = {
                    "phone": phone,
                    "createdAt": timestamp,
                    "content": content
                }
                messages.append(msg)
                if self.callback:
                    self.callback(msg)
                i += 2
            else:
                i += 1
        return messages

    def set_callback(self, callback_fn: Callable[[dict], None]):
        self.callback = callback_fn

    def start_receiver_thread(self, interval: float = 5.0):
        def _loop():
            while True:
                try:
                    self.read_sms()
                except Exception as e:
                    print(f"Error reading SMS in background thread: {e}")
                time.sleep(interval)

        thread = threading.Thread(target=_loop, daemon=True)
        thread.start()