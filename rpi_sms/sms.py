import serial
import time
import threading
from typing import Callable, Optional

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600

class SMSHandler:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE, init_timeout=60):
        self.ser = serial.Serial(port, baud, timeout=1)
        self._lock = threading.Lock()
        self.callback: Optional[Callable[[dict], None]] = None
        self._initialize_modem(init_timeout)

    def _initialize_modem(self, timeout: int):
        """
        Waits for the modem to be fully ready before proceeding.
        Raises TimeoutError if it fails to initialize within the timeout period.
        """
        print("Initializing GSM module...")
        start_time = time.time()

        def check_timeout():
            if time.time() - start_time > timeout:
                raise TimeoutError("GSM module initialization failed. Check antenna, SIM, and power.")
            return False

        with self._lock:
            # Step 1: Wait for the modem to be responsive
            while not check_timeout():
                self.ser.write(b"AT\r")
                if "OK" in self.ser.read(100).decode(errors='ignore'):
                    print("Modem is responsive.")
                    break
                print("Waiting for modem to respond...")
                time.sleep(2)

            # Step 2: Disable command echo
            self._send_at_command("ATE0")
            
            # Step 3: Wait for SIM to be ready
            while not check_timeout():
                response_lines = self._send_at_command("AT+CPIN?")
                if response_lines and "+CPIN: READY" in response_lines[0]:
                    print("SIM card is ready.")
                    break
                print("Waiting for SIM card...")
                time.sleep(2)
            
            # Step 4: Wait for network registration
            while not check_timeout():
                response_lines = self._send_at_command("AT+CREG?")
                if response_lines:
                    # Response can be "+CREG: 0,1" (home) or "+CREG: 0,5" (roaming)
                    if "+CREG: 0,1" in response_lines[0] or "+CREG: 0,5" in response_lines[0]:
                        print("Registered on network.")
                        break
                print("Waiting for network registration...")
                time.sleep(2)

            # Step 5: Final configuration
            self._send_at_command("AT+CMGF=1") # Set to text mode
            self.ser.reset_input_buffer()

        print("GSM module initialized successfully.")

    def _send_at_command(self, command: str, timeout: float = 5.0):
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
                        return None
                    if line != command:
                        lines.append(line)
            print("Warning: Command timed out.")
            return None

    def send_sms(self, phone_number: str, message: str):
        self._send_at_command(f'AT+CMGS="{phone_number}"')
        
        with self._lock:
            print(f"Sending message content to {phone_number}...")
            self.ser.write(message.encode() + b"\x1A")
        
        start_time = time.time()
        while time.time() - start_time < 20:
             response = self.ser.read(100).decode('utf-8', errors='ignore').strip()
             if "+CMGS:" in response:
                 print("SMS sent successfully.")
                 return {"status": "sent", "to": phone_number, "message": message}
             if "ERROR" in response:
                 print("Failed to send SMS.")
                 return {"status": "failed", "to": phone_number, "reason": "Modem returned ERROR"}
        return {"status": "failed", "to": phone_number, "reason": "No confirmation from modem"}

    def read_and_process_sms(self):
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
                    index, status, phone = parts[0].split(":")[1].strip(), parts[1].strip('"'), parts[2].strip('"')
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
