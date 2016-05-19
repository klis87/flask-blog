import os

from flask import Flask


app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def root(path):
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(debug=True)
