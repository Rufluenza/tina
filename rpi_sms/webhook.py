def handle_incoming_sms(sms_data: dict):
    """
    Called automatically when new SMS is received.
    You can modify this to do things like:
    - Save to DB
    - Notify a webhook
    - Trigger other logic
    """
    print("📩 New SMS Received:")
    print(f"From: {sms_data['from']}")
    print(f"Message: {sms_data['message']}")
