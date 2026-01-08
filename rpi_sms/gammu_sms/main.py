# This will hande the main sms functions using gammu
# This will take the webhook calls from the mac and send the sms using gammu
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
"""
Run:
  uvicorn main:app --host 0.0.0.0 --port 8000

Example:
  curl -X POST http://<pi-ip>:8000/send \
       -H "Content-Type: application/json" \
       -d '{"phone": "52228856", "message": "Hello!"}'
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import subprocess

app = FastAPI()

class SMSRequest(BaseModel):
    phone: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)

@app.post("/send")
def send_sms(request: SMSRequest):
    phone = request.phone.strip()
    message = request.message.strip()

    # allow optional '+' then digits
    normalized = phone.lstrip("+")
    if not normalized.isdigit():
        raise HTTPException(status_code=400, detail="phone must be digits (with optional leading '+')")

    try:
        # Use -unicode and -text
        cmd = [
            "gammu-smsd-inject",
            "TEXT", f"+{normalized}",
            "-unicode",
            "-text", message,
        ]
        result = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
        )
        return {"status": "ok", "stdout": result.stdout.strip()}

    except subprocess.CalledProcessError as exc:
        # more explicit error
        detail = (exc.stderr or exc.stdout or str(exc)).strip()
        raise HTTPException(status_code=500, detail=detail)
