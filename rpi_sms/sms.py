import serial
import time
import threading
from typing import Callable, Optional

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600

class SMSHandler:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE):
        self.ser = serial.Serial(port, baud, timeout=1)
        print("Initializing GSM module...")
        time.sleep(2)  # Allow GSM module to initialize
        self.callback: Optional[Callable[[dict], None]] = None
        self._lock = threading.Lock()  # Lock for thread-safe serial access

    def _send_at_command(self, command: str, delay: float = 1.0):
        """Sends a command to the modem and returns the response."""
        with self._lock:  # Ensure only one thread uses the serial port at a time
            print(f"Sending command: {command}")
            self.ser.write((command + "\r").encode())
            time.sleep(delay)
            # Read all available data from the serial buffer
            response = self.ser.read(self.ser.in_waiting or 1).decode(errors="ignore")
            print(f"Response: {response.strip()}")
            return response

    def send_sms(self, phone_number: str, message: str):
        """Sends an SMS message."""
        self._send_at_command("AT")
        self._send_at_command("AT+CMGF=1")  # Set to text mode
        self._send_at_command(f'AT+CMGS="{phone_number}"')
        
        # Send the actual message content with a Ctrl+Z terminator
        with self._lock:
            self.ser.write(message.encode() + b"\x1A")
            time.sleep(3)  # Blind wait for the modem to send
        
        print(f"Command to send SMS to {phone_number} has been issued.")
        return {"status": "sent", "to": phone_number, "message": message}

    def read_sms(self):
        """Reads unread SMS and triggers the processing and deleting."""
        print("Checking for new messages...")
        self._send_at_command("AT+CMGF=1")
        raw_data = self._send_at_command('AT+CMGL="REC UNREAD"')
        self._parse_and_process_sms(raw_data)

    def delete_sms(self, index: str):
        """Sends a command to delete an SMS at a specific index."""
        print(f"Attempting to delete SMS at index: {index}")
        self._send_at_command(f"AT+CMGD={index}")

    def _parse_and_process_sms(self, raw: str):
        """Parses raw message data, triggers callbacks, and deletes messages."""
        lines = raw.splitlines()
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith("+CMGL:"):
                try:
                    # --- 1. Parse the message ---
                    parts = line.split(",")
                    index = parts[0].split(":")[1].strip()
                    phone = parts[2].strip('"')
                    timestamp = parts[4].strip('"')
                    content = lines[i + 1].strip() if i + 1 < len(lines) else ""
                    
                    msg = {"phone": phone, "createdAt": timestamp, "content": content}
                    print(f"Successfully parsed message at index {index} from {phone}")

                    # --- 2. Trigger the webhook callback ---
                    if self.callback:
                        print(f"Triggering webhook for message from {phone}...")
                        self.callback(msg)
                    
                    # --- 3. Delete the message from the SIM ---
                    self.delete_sms(index)

                    i += 2  # Move to the next potential message line
                except (IndexError, ValueError) as e:
                    print(f"Error parsing SMS line: '{line}'. Error: {e}")
                    i += 1
            else:
                i += 1

    def set_callback(self, callback_fn: Callable[[dict], None]):
        self.callback = callback_fn

    def start_receiver_thread(self, interval: float = 5.0):
        """Starts a background thread to periodically check for new messages."""
        def _loop():
            while True:
                try:
                    self.read_sms()
                except Exception as e:
                    print(f"CRITICAL: Error in receiver thread loop: {e}")
                time.sleep(interval)

        print("Starting SMS receiver thread.")
        thread = threading.Thread(target=_loop, daemon=True)
        thread.start()

"""
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
"""