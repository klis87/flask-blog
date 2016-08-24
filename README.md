Flask blog
============

Demo blog application in Flask and Ractive.js for
[Build your Django REST with Flask](http://klisiczynski.com//blog/build-your-django-rest-with-flask-orm-part-1/)
tutorial series.

You can see it live [here](http://ractive-blog.herokuapp.com/). Please note that this demo doesn't have any back-end,
it is only pure front-end just for quick demonstration. If you would like to play with it, see the next section how to
install it.

How to run locally
------------------

1) Install Python dependencies:
```
$ pip install -r requirements.txt
```
2) Create a PostgreSQL database, for example by typing in psql:
```
$ CREATE DATABASE flask_blog;
```
3) Edit `./app/__init__.py` file and adjust below line to match your PostgreSQL settings:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/flask_blog'
```
4) Run below command to create posts table:
```
$ python manage.py db upgrade
```
5) Run the application with:
```
$ python app.py
```
The website will be available at http://127.0.0.1:5000/. Flask admin panel is accessible at http://127.0.0.1:5000/admin

Also, please note that the app was tested on Python 2.7 and 3.4.
