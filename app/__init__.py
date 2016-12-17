import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask.ext.restless import APIManager

from config import POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_DB

app = Flask(__name__)
app.secret_key = 'your secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://{user}:{password}@{host}/{name}'.format(
    host=os.getenv('POSTGRES_HOST', POSTGRES_HOST),
    user=os.getenv('POSTGRES_USER', POSTGRES_USER),
    password=os.getenv('POSTGRES_PASSWORD', POSTGRES_PASSWORD),
    name=os.getenv('POSTGRES_DB', POSTGRES_DB)
)

db = SQLAlchemy(app)
admin_manager = Admin(app, name='Flask Blog Admin', template_mode='bootstrap3')
api_manager = APIManager(app, flask_sqlalchemy_db=db)

from . import models, views, admin
