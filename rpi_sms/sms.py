import serial
import time
import threading
from typing import Callable, Optional

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600

class SMSHandler:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE):
        self.ser = serial.Serial(port, baud, timeout=1)
        self._lock = threading.Lock()  # Lock for thread-safe serial access
        print("Initializing GSM module...")
        self._send_at_command("ATE0")  # Disable command echo
        self._send_at_command("AT+CMGF=1") # Set to text mode
        self.callback: Optional[Callable[[dict], None]] = None
        print("GSM module initialized.")

    def _send_at_command(self, command: str, timeout: float = 5.0):
        """
        Sends a command to the modem and waits for a definitive final response.
        Returns the lines of the response, excluding the final OK/ERROR.
        """
        with self._lock:
            # Clear any stale data in the input buffer
            self.ser.reset_input_buffer()
            
            print(f"Sending command: {command}")
            self.ser.write((command + "\r").encode())

            lines = []
            start_time = time.time()
            while time.time() - start_time < timeout:
                line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    # Filter out unsolicited status messages
                    if line in ("OK", "ERROR", "> "):
                        print(f"Finished command with status: {line}")
                        return lines
                    # Some error codes are prefixed
                    if line.startswith("+CMS ERROR:") or line.startswith("+CME ERROR:"):
                        print(f"Finished command with error: {line}")
                        return lines
                    lines.append(line)
            
            print("Warning: Command timed out.")
            return [] # Timed out

    def send_sms(self, phone_number: str, message: str):
        """Sends an SMS message."""
        # The ">" response is handled by _send_at_command
        self._send_at_command(f'AT+CMGS="{phone_number}"')
        
        with self._lock:
            print(f"Sending message content to {phone_number}...")
            self.ser.write(message.encode() + b"\x1A") # Ctrl+Z to send
        
        # After sending Ctrl+Z, we should get a final response.
        # This part requires a response-reading loop similar to _send_at_command.
        start_time = time.time()
        while time.time() - start_time < 20: # SMS sending can take time
             line = self.ser.readline().decode('utf-8', errors='ignore').strip()
             if line.startswith("+CMGS:"):
                 print(f"SMS sent successfully: {line}")
                 return {"status": "sent", "to": phone_number, "message": message}
             if line == "ERROR":
                 print("Failed to send SMS.")
                 return {"status": "failed", "to": phone_number, "reason": "Modem returned ERROR"}

        return {"status": "failed", "to": phone_number, "reason": "No confirmation from modem"}


    def read_and_process_sms(self):
        """Reads unread SMS, processes them, and deletes them."""
        print("Checking for new messages...")
        response_lines = self._send_at_command('AT+CMGL="ALL"') # Read all messages to be safe

        i = 0
        while i < len(response_lines):
            line = response_lines[i]
            if line.startswith("+CMGL:"):
                try:
                    # --- 1. Parse the message ---
                    parts = line.split(",")
                    index = parts[0].split(":")[1].strip()
                    status = parts[1].strip('"') # "REC UNREAD", "REC READ", etc.
                    phone = parts[2].strip('"')
                    
                    # The content is the next line
                    content = response_lines[i + 1] if (i + 1) < len(response_lines) else ""
                    
                    msg = {"phone": phone, "content": content}
                    print(f"Found message at index {index} from {phone} with status '{status}'")

                    # --- 2. Process only unread messages ---
                    if "UNREAD" in status and self.callback:
                        print(f"Processing unread message and triggering webhook...")
                        self.callback(msg)
                    
                    # --- 3. Delete the message from the SIM ---
                    print(f"Deleting message at index {index} to free up space.")
                    self._send_at_command(f"AT+CMGD={index}")

                    i += 2  # Move past the content line
                except (IndexError, ValueError) as e:
                    print(f"Error parsing SMS line: '{line}'. Error: {e}")
                    i += 1
            else:
                i += 1
    
    def read_sms(self):
        self._send_at_command("AT+CMGF=1")
        self._send_at_command('AT+CMGL="REC UNREAD"')  # Only unread messages
        raw_data = self.ser.read(self.ser.in_waiting or 1).decode(errors="ignore")
        return self._parse_sms(raw_data)

    def set_callback(self, callback_fn: Callable[[dict], None]):
        self.callback = callback_fn

    def start_receiver_thread(self, interval: float = 10.0):
        """Starts a background thread to periodically check for new messages."""
        def _loop():
            while True:
                try:
                    self.read_and_process_sms()
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