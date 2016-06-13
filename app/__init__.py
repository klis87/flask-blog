from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask.ext.restless import APIManager

app = Flask(__name__)
app.secret_key = 'your secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/flask_blog'

db = SQLAlchemy(app)
admin_manager = Admin(app, name='Flask Blog Admin', template_mode='bootstrap3')
api_manager = APIManager(app, flask_sqlalchemy_db=db)

from . import models, views, admin
