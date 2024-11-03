import serial
import time

# Initialize serial connection
serial_port = serial.Serial('/dev/serial0', 9600, timeout=1)

def send_command(command, delay=1):
    serial_port.write((command + "\r\n").encode())
    time.sleep(delay)
    response = serial_port.readlines()
    return response

def initialize_gsm_module():
    send_command("AT") # Check module status
    send_command("ATE0") # Disable echo
    send_command("AT+CMGF=1") # Set SMS text mode
    send_command("AT+CREG?") # Check network registration 

def read_sms():
    messages = send_command(r'AT+CMGL="ALL"', delay=2)
    messages_clean = []
    for msg in messages:
        print(msg.decode().strip())
        messages_clean.append(msg.decode().strip())
    return messages_clean

if __name__ == "__main__":
    initialize_gsm_module()
    
    all_msg = read_sms()
    print("Fetched all messages")
    print(all_msg)
    serial_port.close()