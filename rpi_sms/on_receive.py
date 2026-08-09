#!/usr/bin/env python3

import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime

MAC_URL = "http://rubensmac.com:3000/api/receive-sms-webhook"
LOGFILE = "/home/pi/sms-webhook.log"


def log(msg):
    with open(LOGFILE, "a") as f:
        f.write(f"{datetime.now():%F %T} {msg}\n")


def get_text():
    numparts = int(os.environ.get("DECODED_PARTS", "0"))
    if numparts == 0:
        return os.environ.get("SMS_1_TEXT", "")
    text = ""
    for i in range(1, numparts + 1):
        varname = f"DECODED_{i}_TEXT"
        if varname in os.environ:
            text += os.environ[varname]
    return text


def main():
    phone = os.environ.get("SMS_1_NUMBER", "unknown")
    text = get_text()

    payload = json.dumps({"phone": phone, "content": text}).encode("utf-8")
    log(f"-> phone={phone} content={text!r}")

    req = urllib.request.Request(
        MAC_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            log(f"<- HTTP {resp.status} {resp.read().decode()}")
    except urllib.error.HTTPError as e:
        log(f"<- HTTP {e.code} {e.read().decode()}")
    except urllib.error.URLError as e:
        log(f"<- FAILED {e.reason}")

    # Always exit 0 so gammu-smsd doesn't treat this as a processing failure
    sys.exit(0)


if __name__ == "__main__":
    main()