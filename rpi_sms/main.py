# Use venv to create a virtual environment
# python -m venv rpi_server
# source rpi_server/bin/activate
# pip install fastapi uvicorn pyserial
# hostname -I
# run:
# uvicorn main:app --host 0.0.0.0 --port 8000
"""
send SMS:

curl -X POST http://<pi-ip>:8000/send \
     -H "Content-Type: application/json" \
     -d '{"phone": "52228856", "message": "Hello!"}'

receive SMS:
curl http://<pi-ip>:8000/receive
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sms import SMSHandler
from webhook import handle_incoming_sms

app = FastAPI()
sms = SMSHandler()
sms.set_callback(handle_incoming_sms)
sms.start_receiver_thread()  # Starts listening for incoming messages

class SMSRequest(BaseModel):
    phone: str
    message: str

@app.post("/send")
def send_sms(request: SMSRequest):
    try:
        print(f"Sending SMS to {request.phone}: {request.message}")
        result = sms.send_sms(request.phone, request.message)
        print(f"SMS sent successfully: {result}")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# How can i make it so that if i send /read it also does the same as /receive?
# While keeping the /receive endpoint for reading SMS messages?
# so it can be used interchangeably
@app.get("/receive")
def receive_sms():
    try:
        messages = sms.read_sms()
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))