import requests
WEBHOOK_URL = "http://192.168.1.191:3000/api/receive-sms-webhook"

def notify_webhook(message_data: dict):
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=message_data,
            timeout=5,
        )
        response.raise_for_status()
    except Exception as e:
        print(f"[Webhook Error] Could not notify Next.js: {e}")

def handle_incoming_sms(sms_data: dict):
    """
    Called automatically when new SMS is received.
    You can modify this to do things like:
    - Save to DB
    - Notify a webhook
    - Trigger other logic
    """
    print("📩 New SMS Received:")
    print(f"From: {sms_data['phone']}")
    print(f"Message: {sms_data['content']}")

    # Notify the webhook
    notify_webhook(sms_data)
