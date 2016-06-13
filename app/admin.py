from flask_admin.contrib.sqla import ModelView

from . import db, admin_manager
from .models import Post

admin_manager.add_view(ModelView(Post, db.session))
