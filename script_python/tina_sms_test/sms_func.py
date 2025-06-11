import serial
import time
from datetime import datetime

# Configure the serial port
SERIAL_PORT = '/dev/serial0'  # Change if necessary
BAUD_RATE = 9600  # Default baud rate for SIM800L

# Initialize the serial connection
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # Give the module time to initialize

def send_sms(phone_number, message):
    # EXAMPLE USAGE:
    #send_sms("52228856", "Test sms fra Ruben")
    # ---
    ser.write(b'AT\r')  # Send AT command
    time.sleep(1)
    ser.write(b'AT+CMGF=1\r')  # Set SMS to text mode
    time.sleep(1)
    ser.write(f'AT+CMGS="{phone_number}"\r'.encode())  # Specify the phone number
    time.sleep(1)
    ser.write(message.encode() + b'\x1A')  # Send the message followed by Ctrl+Z
    time.sleep(3)  # Wait for the message to be sent
    print("SMS sent.")

def receive_sms():
    ser.write(b'AT+CMGF=1\r')  # Ensure we're in text mode
    time.sleep(1)
    ser.write(b'AT+CMGL="ALL"\r')  # List all SMS messages
    time.sleep(1)
    raw_data = ser.read(ser.in_waiting or 1).decode(errors='ignore')

    lines = raw_data.splitlines()
    messages = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('+CMGL:'):
            # Example: +CMGL: 1,"REC READ","+4552228856","","24/10/30,18:31:31+04"
            parts = line.split(',')
            if len(parts) >= 5:
                phone_number = parts[2].strip('"')
                dt = parts[4].strip('"')  # Timestamp in the format "24/10/30,18:31:31+04"
                """
                timestamp_str = parts[4].strip('"')
                
                # Convert timestamp to datetime object (ignoring timezone for now)
                try:
                    dt = datetime.strptime(timestamp_str[:17], r'%y/%m/%d,%H:%M:%S')
                except ValueError:
                    dt = None  # Fallback if parsing fails

                #content = lines[i + 1].strip() if i + 1 < len(lines) else ''
                """
                
                # Next line should be the message content
                if i + 1 < len(lines):
                    content = lines[i + 1].strip()
                else:
                    content = ''
                messages.append({
                    'phone_number': phone_number,
                    'time': dt,
                    'content': content
                })
            i += 2  # Skip next line since it's the message content
        else:
            i += 1

    return messages


try:
    messages = receive_sms()
    for msg in messages:
        print(f"From: {msg['phone_number']}, Time: {msg['time']}, Message: {msg['content']}")
finally:
    ser.close()


