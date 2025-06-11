from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
casc_option = "all, delete-orphan"

# this is for a sms app so the user will have contacts and messages that are from and to Contacts
class Contacts(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default='Contact') # Name of the contact
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    messages_sent = db.relationship('Message', backref='sender', lazy='dynamic', cascade=casc_option)
    messages_received = db.relationship('Message', backref='receiver', lazy='dynamic', cascade=casc_option)
    
    def __repr__(self):
        return f'<Contact {self.name} - {self.phone_number}>'

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('contacts.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('contacts.id'), nullable=False)

    def __repr__(self):
        return f'<Message {self.id} from {self.sender.name} to {self.receiver.name}>'