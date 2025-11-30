import serial
import time
import threading
from typing import Callable, Optional, List, Dict, Any

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600


class SMSHandler:
    def __init__(self, port: str = SERIAL_PORT, baud: int = BAUD_RATE):
        self.ser = serial.Serial(port, baud, timeout=1)
        time.sleep(2)  # Allow GSM module to initialize
        self.callback: Optional[Callable[[dict], None]] = None

        self._init_modem()

    # ---------- MODEM INIT ----------

    def _init_modem(self) -> None:
        """
        Run once. Sets:
        - Text mode
        - UCS2 charset (for æ,ø,å)
        - Storage to SM_P
        - New message indication (optional)
        """
        self._send_at_command("AT")
        self._send_at_command("AT+CMGF=1")  # text mode
        self._send_at_command('AT+CSCS="UCS2"')
        self._send_at_command('AT+CPMS="SM_P","SM_P","SM_P"')
        # URC for new SMS (you can later evolve this into a full listener)
        self._send_at_command("AT+CNMI=2,1,0,0,0")

    # ---------- LOW LEVEL AT ----------

    def _send_at_command(self, command: str, delay: float = 0.3, timeout: float = 2.0) -> str:
        """
        Send an AT command and read back the response.
        This avoids piling up junk in the serial buffer.
        """
        # Clear old data before sending a new command
        self.ser.reset_input_buffer()
        self.ser.write((command + "\r").encode())

        # Give the modem a moment to respond
        time.sleep(delay)

        end_time = time.time() + timeout
        resp_bytes = bytearray()

        while time.time() < end_time:
            chunk = self.ser.read(self.ser.in_waiting or 0)
            if chunk:
                resp_bytes.extend(chunk)
            else:
                # No data right now; wait a bit and check again
                time.sleep(0.05)

        resp = resp_bytes.decode(errors="ignore")
        # print(f">>> {command}\n{resp}")  # uncomment for debugging
        return resp

    @staticmethod
    def _to_ucs2(text: str) -> str:
        return "".join(f"{ord(c):04X}" for c in text)

    @staticmethod
    def _decode_ucs2_maybe(hex_str: str) -> str:
        """
        Try to decode UCS2, fall back gracefully if the content is not valid hex/UCS2.
        This reduces the "sometimes wrong encoding" issue.
        """
        # Short sanity check: even length and only hex chars
        hs = hex_str.strip()
        if len(hs) % 4 != 0:
            # Might not be UCS2; just return as-is
            return hs

        try:
            return bytes.fromhex(hs).decode("utf-16-be")
        except Exception:
            return hs

    # ---------- PUBLIC API ----------

    def clear_sms_storage(self) -> Dict[str, Any]:
        """
        Delete all SMS from current memory (SM_P).
        """
        try:
            self._send_at_command("AT")
            self._send_at_command("AT+CMGF=1")
            resp = self._send_at_command("AT+CMGD=1,4", timeout=5.0)
            ok = "OK" in resp and "ERROR" not in resp
            return {"status": "cleared" if ok else "error", "raw_response": resp}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        """
        Send an SMS with UCS2 so æ/ø/å works.
        Returns a structured result so you can set Messages.isSent.
        """
        try:
            self._send_at_command("AT")
            self._send_at_command("AT+CMGF=1")
            self._send_at_command('AT+CSCS="UCS2"')

            ucs2_number = self._to_ucs2(phone_number)
            ucs2_message = self._to_ucs2(message)

            # Start CMGS (don't use _send_at_command here because we need the '>' prompt)
            self.ser.reset_input_buffer()
            self.ser.write((f'AT+CMGS="{ucs2_number}"\r').encode())
            time.sleep(0.5)

            # Send the message and Ctrl+Z
            self.ser.write(ucs2_message.encode() + b"\x1A")
            time.sleep(3)

            # Read the modem's response to CMGS
            resp = self.ser.read(self.ser.in_waiting or 1).decode(errors="ignore")

            success = ("OK" in resp) and ("+CMS ERROR" not in resp)
            return {
                "success": success,
                "status": "sent" if success else "error",
                "to": phone_number,
                "message": message,
                "raw_response": resp,
            }
        except Exception as e:
            # For DB: isSent = False, store error message
            return {
                "success": False,
                "status": "exception",
                "to": phone_number,
                "message": message,
                "error": str(e),
            }

    def read_sms(self, include_read: bool = False) -> List[dict]:
        """
        Read SMS messages from SIM.
        - If include_read=False: only REC UNREAD (your polling loop use-case).
        - If include_read=True: both REC UNREAD and REC READ (for maintenance, etc.)
        """
        try:
            self._send_at_command("AT")
            # We assume mode/charset/storage already set in _init_modem
            box = '"REC UNREAD"' if not include_read else '"ALL"'
            raw_data = self._send_at_command(f"AT+CMGL={box}", delay=1.0, timeout=3.0)
            return self._parse_sms(raw_data)
        except Exception as e:
            print(f"[SMS Read Error] {e}")
            return []

    def delete_read_messages(self) -> Dict[str, Any]:
        """
        Delete messages with status REC READ from SIM.
        Strategy:
        1) List ALL messages.
        2) Parse them, collect indexes with status == "REC READ".
        3) AT+CMGD=<index> for each.
        """
        try:
            data = self._send_at_command('AT+CMGL="ALL"', delay=1.0, timeout=3.0)
            messages = self._parse_sms(data)

            deleted = []
            for msg in messages:
                if msg.get("status") == "REC READ" and msg.get("index") is not None:
                    idx = msg["index"]
                    self._send_at_command(f"AT+CMGD={idx}", timeout=2.0)
                    deleted.append(idx)

            return {"status": "ok", "deleted_indexes": deleted}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    # ---------- PARSER ----------

    def _parse_sms(self, raw: str) -> List[dict]:
        """
        Parse CMGL output with UCS2 phone/content.
        """
        messages: List[dict] = []
        lines = [line.strip() for line in raw.splitlines() if line.strip()]
        i = 0

        while i < len(lines):
            line = lines[i]
            if line.startswith("+CMGL:"):
                header = line[len("+CMGL:"):].strip()
                parts = [p.strip() for p in header.split(",")]

                if len(parts) < 5:
                    i += 1
                    continue

                try:
                    index = int(parts[0])
                except ValueError:
                    index = None

                status = parts[1].strip('"')
                raw_phone = parts[2].strip('"')
                timestamp = parts[4].strip('"')

                # Next line should be content; if next line is another +CMGL, we treat content as empty
                raw_content = ""
                if i + 1 < len(lines) and not lines[i + 1].startswith("+CMGL:"):
                    raw_content = lines[i + 1]
                    i += 2
                else:
                    i += 1

                phone = self._decode_ucs2_maybe(raw_phone)
                content = self._decode_ucs2_maybe(raw_content)

                msg = {
                    "index": index,
                    "status": status,       # "REC UNREAD" / "REC READ" etc.
                    "phone": phone,
                    "createdAt": timestamp,
                    "content": content,
                }
                messages.append(msg)

                if self.callback:
                    try:
                        self.callback(msg)
                    except Exception as cb_err:
                        print(f"[SMS Callback Error] {cb_err}")
            else:
                i += 1

        return messages

    # ---------- CALLBACK & POLLER ----------

    def set_callback(self, callback_fn: Callable[[dict], None]):
        self.callback = callback_fn

    def start_receiver_thread(self, interval: float = 5.0):
        """
        Poll every `interval` seconds for new (REC UNREAD) messages.
        Uses a background thread; does not block main program.
        """

        def _loop():
            next_run = time.monotonic()
            while True:
                try:
                    self.read_sms(include_read=False)
                except Exception as e:
                    print(f"[SMS Receiver Error] {e}")

                next_run += interval
                sleep_time = max(0, next_run - time.monotonic())
                time.sleep(sleep_time)

        thread = threading.Thread(target=_loop, daemon=True)
        thread.start()
