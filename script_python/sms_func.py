import serial
import time
import sys
import json

# Initialize serial connection
serial_port = serial.Serial('/dev/serial0', 9600, timeout=1)

def send_command(command, delay=1):
    serial_port.write((command + "\r\n").encode())
    time.sleep(delay)
    response = serial_port.readlines()
    return response

def initialize_gsm_module():
    send_command("AT")  # Check module status
    send_command("ATE0")  # Disable echo
    send_command("AT+CMGF=1")  # Set SMS text mode
    send_command("AT+CREG?")  # Check network registration

def read_sms():
    messages = send_command(r'AT+CMGL="ALL"', delay=2)
    messages_clean = []
    for msg in messages:
        decoded_msg = msg.decode().strip()
        if decoded_msg:
            messages_clean.append(decoded_msg)
    return messages_clean

def send_sms(phone_number, message):
    initialize_gsm_module()
    send_command(f'AT+CMGS="{phone_number}"')
    send_command(message + chr(26), delay=5)  # chr(26) is the ASCII code for Ctrl+Z (end of message)
    response = serial_port.readlines()
    return response

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        return

    action = sys.argv[1]

    initialize_gsm_module()

    if action == "fetch_sms":
        messages = read_sms()
        print(json.dumps({"messages": messages}))
    elif action == "send_sms":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Phone number or message text missing"}))
            return
        phone_number = sys.argv[2]
        message = sys.argv[3]
        response = send_sms(phone_number, message)
        print(json.dumps({"status": "SMS sent", "response": [r.decode().strip() for r in response]}))
    else:
        print(json.dumps({"error": "Invalid action specified"}))

    serial_port.close()

if __name__ == "__main__":
    main()
