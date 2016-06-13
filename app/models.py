from . import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(60), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    publication_date = db.Column(db.Date, nullable=False)
    published = db.Column(db.Boolean, nullable=False)
