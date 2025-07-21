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
        result = sms.send_sms(request.phone, request.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/receive")
def receive_sms():
    try:
        messages = sms.read_sms()
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
