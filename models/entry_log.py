from datetime import datetime
from database import db

class EntryLog(db.Model):
    """入園履歴モデル"""

    __tablename__ = 'entry_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tkt_number = db.Column(db.String(10), db.ForeignKey('tickets.tkt_number'), nullable=False)
    entry_time = db.Column(db.DateTime, nullable=False, default=datetime.now)
    result = db.Column(db.String(5), nullable=False)  # "OK", "NG"
    comment = db.Column(db.Text, nullable=True)
    is_reentry = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'tkt_number': self.tkt_number,
            'entry_time': self.entry_time.isoformat() if self.entry_time else None,
            'result': self.result,
            'comment': self.comment,
            'is_reentry': self.is_reentry,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<EntryLog {self.id}: {self.tkt_number}>'
