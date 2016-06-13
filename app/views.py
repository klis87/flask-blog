from . import app, api_manager
from .models import Post

api_manager.create_api(Post, methods=['GET', 'POST', 'DELETE', 'PUT'], results_per_page=0)


@app.route('/<path:path>')
@app.route('/', defaults={'path': ''})
def root(path):
    return app.send_static_file('index.html')
