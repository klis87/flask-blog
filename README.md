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

The easiest way to start is by using Docker Compose:

1) Adjust env variables in `.env` file to your liking (not required), and run:
```
$ docker-compose up -d
```
2) Create PostgreSQL tables with:
```
$ docker-compose exec web python manage.py db upgrade
```

Or, if you don't want to use Docker, do the following steps:

1) Install Python dependencies:
```
$ pip install -r requirements.txt
```
2) Edit `config.py` to your liking (this is not required)

3) Create a PostgreSQL database, for example by typing in psql:
```
$ CREATE DATABASE flask_blog;
```
4) Run below command to create posts table:
```
$ python manage.py db upgrade
```
5) Run the application with:
```
$ python runserver.py
```

No matter you used Docker or not, the website will be available at http://127.0.0.1:5000/.
Flask admin panel is accessible at http://127.0.0.1:5000/admin.

Also, please note that the app was tested on Python 2.7 and 3.4+.
