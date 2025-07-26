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

    def send_sms(self, phone_number: str, message: str):
        self._send_at_command("AT")
        self._send_at_command("AT+CMGF=1")  # Set text mode
        self._send_at_command(f'AT+CMGS="{phone_number}"')
        self.ser.write(message.encode() + b"\x1A")
        time.sleep(3)
        return {"status": "sent", "to": phone_number, "message": message}

    def read_sms(self):
        self._send_at_command("AT+CMGF=1")
        self._send_at_command('AT+CMGL="REC UNREAD"')  # Only unread messages
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
                phone = parts[2].strip('"')
                timestamp = parts[4].strip('"')
                content = lines[i + 1].strip() if i + 1 < len(lines) else ""
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