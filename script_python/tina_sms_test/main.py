# init the database
from models import db, Contacts, Message
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sms_func import receive_sms
from sort_sms import sort_sms
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sms_app.db'  # Use SQLite for simplicity
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Disable track modifications to save resources
db.init_app(app)
with app.app_context():
    db.create_all()  # Create the database tables if they don't exist
    

def show_data():
    contacts = Contacts.query.all()
    messages = Message.query.all()
    
    print("Contacts:")
    for contact in contacts:
        print(contact)
    
    print("\nMessages:")
    for message in messages:
        print(message)
        
if __name__ == "__main__":
    with app.app_context():
        # Uncomment the next line to sort SMS messages and add contacts to the database
        sort_sms()
        
        # Show the data in the database
        show_data()
        
        # Uncomment the next line to receive SMS messages
        # receive_sms()  # This will print received SMS messages from the module