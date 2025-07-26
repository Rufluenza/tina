import serial
import time
import threading
from typing import Callable, Optional

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600

class SMSHandler:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE):
        self.ser = serial.Serial(port, baud, timeout=1)
        self._lock = threading.Lock()
        self.callback: Optional[Callable[[dict], None]] = None
        self._initialize_modem()

    def _initialize_modem(self):
        """
        Waits for the modem to be fully ready before proceeding.
        """
        print("Initializing GSM module...")
        with self._lock:
            # Wait for the modem to be ready
            while True:
                self.ser.write(b"AT\r")
                response = self.ser.read(100).decode(errors='ignore')
                if "OK" in response:
                    print("Modem is responsive.")
                    break
                print("Waiting for modem to respond...")
                time.sleep(1)

            # Disable command echo
            self.ser.write(b"ATE0\r")
            time.sleep(0.5)
            
            # Wait for SIM to be ready
            while True:
                self.ser.write(b"AT+CPIN?\r")
                response = self.ser.read(100).decode(errors='ignore')
                if "+CPIN: READY" in response:
                    print("SIM card is ready.")
                    break
                print("Waiting for SIM card...")
                time.sleep(1)
            
            # Wait for network registration
            while True:
                self.ser.write(b"AT+CREG?\r")
                response = self.ser.read(100).decode(errors='ignore')
                if "+CREG: 0,1" in response or "+CREG: 0,5" in response:
                    print("Registered on network.")
                    break
                print("Waiting for network registration...")
                time.sleep(1)

            # Set to text mode
            self.ser.write(b"AT+CMGF=1\r")
            time.sleep(0.5)
            self.ser.reset_input_buffer()
        print("GSM module initialized successfully.")

    def _send_at_command(self, command: str, timeout: float = 5.0):
        """
        Sends a command and reads the response until a final "OK" or "ERROR".
        """
        with self._lock:
            self.ser.reset_input_buffer()
            print(f"Sending command: {command}")
            self.ser.write((command + "\r").encode())

            lines = []
            start_time = time.time()
            while time.time() - start_time < timeout:
                line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    if line == "OK":
                        return lines
                    if "ERROR" in line:
                        print(f"Command failed with error: {line}")
                        return None # Indicate failure
                    if line != command: # Filter out the command echo if it's still on
                        lines.append(line)
            print("Warning: Command timed out.")
            return None

    def send_sms(self, phone_number: str, message: str):
        """Sends an SMS message."""
        # The ">" character is the prompt for the message content
        self._send_at_command(f'AT+CMGS="{phone_number}"')
        
        with self._lock:
            print(f"Sending message content to {phone_number}...")
            self.ser.write(message.encode() + b"\x1A") # Ctrl+Z to send
        
        # Wait for the final confirmation from the modem
        start_time = time.time()
        while time.time() - start_time < 20: # SMS sending can take time
             response = self.ser.read(100).decode('utf-8', errors='ignore').strip()
             if "+CMGS:" in response:
                 print(f"SMS sent successfully.")
                 return {"status": "sent", "to": phone_number, "message": message}
             if "ERROR" in response:
                 print("Failed to send SMS.")
                 return {"status": "failed", "to": phone_number, "reason": "Modem returned ERROR"}
        return {"status": "failed", "to": phone_number, "reason": "No confirmation from modem"}

    def read_and_process_sms(self):
        """Reads all SMS, processes unread ones, and deletes all of them."""
        print("Checking for new messages...")
        response_lines = self._send_at_command('AT+CMGL="ALL"')

        if response_lines is None:
            print("Could not read messages, command failed.")
            return

        i = 0
        while i < len(response_lines):
            line = response_lines[i]
            if line.startswith("+CMGL:"):
                try:
                    parts = line.split(",")
                    index = parts[0].split(":")[1].strip()
                    status = parts[1].strip('"')
                    phone = parts[2].strip('"')
                    content = response_lines[i + 1]
                    
                    print(f"Found message at index {index} from {phone} with status '{status}'")
                    if "UNREAD" in status and self.callback:
                        print("Processing unread message and triggering webhook...")
                        self.callback({"phone": phone, "content": content})
                    
                    print(f"Deleting message at index {index} to free up space.")
                    self._send_at_command(f"AT+CMGD={index}")
                    i += 2
                except (IndexError, ValueError) as e:
                    print(f"Error parsing SMS line: '{line}'. Error: {e}")
                    i += 1
            else:
                i += 1

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
