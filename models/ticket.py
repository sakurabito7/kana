from datetime import datetime
from database import db

class Ticket(db.Model):
    """年間パスポート情報モデル"""

    __tablename__ = 'tickets'

    tkt_number = db.Column(db.String(10), primary_key=True)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)  # "男性", "女性", "それ以外"
    ticket_type = db.Column(db.String(10), nullable=False)  # "大人", "子供"
    start_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    is_transfer = db.Column(db.Boolean, default=False)
    previous_tkt_number = db.Column(db.String(10), nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # リレーション
    entry_logs = db.relationship('EntryLog', backref='ticket', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'tkt_number': self.tkt_number,
            'age': self.age,
            'gender': self.gender,
            'ticket_type': self.ticket_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'is_transfer': self.is_transfer,
            'previous_tkt_number': self.previous_tkt_number,
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Ticket {self.tkt_number}>'
