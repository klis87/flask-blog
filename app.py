from flask import Flask


application = Flask(__name__)

@application.route('/', defaults={'path': ''})
@application.route('/<path:path>')
def root(path):
    return application.send_static_file('index.html')


if __name__ == '__main__':
    application.run(debug=True)
