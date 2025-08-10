from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Tender(db.Model):
    __tablename__ = 'tenders'
    
    id = db.Column(db.Integer, primary_key=True)
    province = db.Column(db.String(100))
    location = db.Column(db.String(200))
    tender_deadline = db.Column(db.Date)
    status = db.Column(db.String(100))
    details = db.Column(db.Text)
    expensive_ratio = db.Column(db.Float, default=0.0)
    midrange_ratio = db.Column(db.Float, default=0.0)
    social_ratio = db.Column(db.Float, default=0.0)
    municipality = db.Column(db.String(100))
    winner = db.Column(db.String(200))
    number_of_properties = db.Column(db.Integer)
    publication_date = db.Column(db.Date)
    tender_longitude = db.Column(db.Float)
    tender_latitude = db.Column(db.Float)
    center_municipality_longitude = db.Column(db.Float)
    center_municipality_latitude = db.Column(db.Float)
    
    def to_dict(self):
        return {
            'id': self.id,
            'province': self.province,
            'location': self.location,
            'tender_deadline': self.tender_deadline.isoformat() if self.tender_deadline else None,
            'status': self.status,
            'details': self.details,
            'expensive_ratio': self.expensive_ratio,
            'midrange_ratio': self.midrange_ratio,
            'social_ratio': self.social_ratio,
            'municipality': self.municipality,
            'winner': self.winner,
            'number_of_properties': self.number_of_properties,
            'publication_date': self.publication_date.isoformat() if self.publication_date else None,
            'tender_longitude': self.tender_longitude,
            'tender_latitude': self.tender_latitude,
            'center_municipality_longitude': self.center_municipality_longitude,
            'center_municipality_latitude': self.center_municipality_latitude,
        }