# This is a script that when run will sort the SMS messages in the database and add the contacts to the database if they do not already exist.
from sms_func import receive_sms
from models import db, Contacts, Message

# This is the output of the receive_sms function, which retrieves SMS messages from the module.
"""
(.venv) pi@raspberrypi:~/Desktop/tina_sms_test $ /home/pi/Desktop/tina_sms_test/.venv/bin/python /home/pi/Desktop/tina_sms_test/sms_func.py
AT+CMGL="ALL"
+CMGL: 1,"REC READ","+4552228856","","24/10/30,18:31:31+04"
Test af svar fra bruger 

+CMGL: 2,"REC READ","+4552228856","","24/10/30,18:31:38+04"
Fik du den

+CMGL: 3,"REC READ","+4526806806","","24/10/30,20:59:55+04"
Svar onsdag kl 21:00

+CMGL: 4,"REC READ","+4552228856","","25/06/11,14:44:11+08"
Tilbagebesked uden kontekst 

OK
"""

def sort_sms():
    messages = receive_sms()
    for message in messages:
        sender_phone = message['sender']
        receiver_phone = message['receiver']
        content = message['content']
        timestamp = message['timestamp']

        # Ensure sender contact exists
        sender_contact = Contacts.query.filter_by(phone_number=sender_phone).first()
        if not sender_contact:
            sender_contact = Contacts(name=f"Contact {sender_phone}", phone_number=sender_phone)
            db.session.add(sender_contact)

        # Ensure receiver contact exists
        receiver_contact = Contacts.query.filter_by(phone_number=receiver_phone).first()
        if not receiver_contact:
            receiver_contact = Contacts(name=f"Contact {receiver_phone}", phone_number=receiver_phone)
            db.session.add(receiver_contact)

        # Create and add the message
        # if the message is not already in the database
        existing_message = Message.query.filter_by(content=content, timestamp=timestamp, sender=sender_contact, receiver=receiver_contact).first()
        if not existing_message:
            new_message = Message(content=content, timestamp=timestamp, sender=sender_contact, receiver=receiver_contact)
            continue
        
            db.session.add(new_message)

    db.session.commit()
    print("SMS messages sorted and contacts added to the database.")
    