import serial
import time
import threading
from typing import Callable, Optional

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600

class SMSHandler:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE):
        self.ser = serial.Serial(port, baud, timeout=1)
        time.sleep(2)  # Allow GSM module to initialize
        self.callback: Optional[Callable[[dict], None]] = None

    def _send_at_command(self, command: str, delay: float = 1.0):
        self.ser.write((command + "\r").encode())
        time.sleep(delay)
    
    def send_ucs2(text: str):
        return ''.join(f'{ord(c):04X}' for c in text)
    
    def clear_sms_storage(self):
        self._send_at_command("AT")
        self._send_at_command("AT+CMGF=1")  # Set text mode
        self._send_at_command('AT+CMGD=1,4')  # Delete all messages
        time.sleep(1)
        return {"status": "cleared"}

    def send_sms(self, phone_number: str, message: str):
        def text_to_ucs2(text: str):
            return ''.join(f'{ord(c):04X}' for c in text)

        self._send_at_command("AT")
        self._send_at_command('AT+CSCS="UCS2"')     # Set character set to UCS2
        self._send_at_command("AT+CMGF=1")          # Set SMS text mode

        ucs2_number = text_to_ucs2(phone_number)
        ucs2_message = text_to_ucs2(message)

        self._send_at_command(f'AT+CMGS="{ucs2_number}"', delay=0.5)
        self.ser.write(ucs2_message.encode() + b"\x1A")
        time.sleep(3)

        return {"status": "sent", "to": phone_number, "message": message}

    def read_sms(self):
        self._send_at_command("AT")
        self._send_at_command('AT+CSCS="UCS2"')
        self._send_at_command("AT+CMGF=1")
        self._send_at_command('AT+CMGL="REC UNREAD"')
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
                #phone = parts[2].strip('"')
                raw_phone = parts[2].strip('"')
                timestamp = parts[4].strip('"')
                #content = lines[i + 1].strip() if i + 1 < len(lines) else ""
                raw_content = lines[i + 1].strip() if i + 1 < len(lines) else ""
                try:
                    phone = bytes.fromhex(raw_phone).decode("utf-16-be")
                    content = bytes.fromhex(raw_content).decode("utf-16-be")
                except Exception:
                    phone = raw_phone
                    content = raw_content  # fallback

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
                self.read_sms()
                time.sleep(interval)

        thread = threading.Thread(target=_loop, daemon=True)
        thread.start()