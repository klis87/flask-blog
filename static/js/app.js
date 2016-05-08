var component = Ractive.extend({
    isolated: true
});

var home = component.extend({
    template: `
        <h1>Ractive blog</h1>
        {{#each posts}}
          <div class="panel panel-default">
            <div class="panel-heading">
              <h2 class="panel-title"><a href="/{{ id }}/">{{ title }}</a></h2>
            </div>
            <div class="panel-body">{{ content }}</div>
          </div>
        {{/each}}
    `,
    data: function() {
        return {
            posts: posts
        };
    }
});

var postDetail = component.extend({
    template: `
        <h1>{{ post.title }}</h1>
        <p>{{ post.content }}</p>
    `,
    data: function() {
        return {
            post: {}
        };
    },
    oninit: function() {
        this.observe('id', function(value) {
            if (value) {
                this.getPost(value);
            }
        });
    },
    getPost: function(id) {
        this.set('post', posts.filter(function(v) { return v.id == id; })[0]);
    }
});

var admin = component.extend({
    data: function() {
        return {
            posts: posts
        };
    },
    template: `
        <h1>Admin panel</h1>
        <a class="btn btn-success" href="/admin/new/">New post</a>
        <hr>
        {{#each posts: i}}
          <div class="panel panel-default">
            <div class="panel-heading clearfix">
              <button on-click="remove(i)" class="btn btn-danger btn-sm pull-right">Remove</button>
              <h2 class="panel-title"><a href="/admin/{{ id }}/">{{ title }}</a></h2>
            </div>
            <div class="panel-body">{{ content }}</div>
          </div>
        {{/each}}
    `,
    remove: function(index) {
        this.get('posts').splice(index, 1);
    }
});

var editedPostForm = component.extend({
    data: function() {
        return {
            posts: posts,
            post: {}
        }
    },
    template: `
        <form>
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" value="{{ postState.title }}" class="form-control">
            </div>
            <div class="form-group">
                <label for="content">Content</label>
                <input type="text" id="content" value="{{ postState.content }}" class="form-control">
            </div>
            <button class="btn btn-primary pull-right" type="button" on-click="save()">Save</button>
        </form>
    `,
    computed: {
        postState: function() {
            return $.extend({}, this.get('post'));
        }
    },
    save: function() {
        var postState = this.get('postState');
        var posts = this.get('posts');
        var editedPostIndex = posts.map(function(v) { return v.id; }).indexOf(postState.id);
        this.set(`posts[${editedPostIndex}]`, postState);
        this.set('post', postState);
    }
});

var newPostForm = editedPostForm.extend({
    calculateNextId: function() {
        var posts = this.get('posts');
        var nextId;

        if (posts.length === 0) {
            nextId = 1;
        } else {
            nextId = posts[posts.length - 1].id + 1;
        }

        return nextId;
    },
    save: function() {
        var postState = this.get('postState');
        postState.id = this.calculateNextId();
        var posts = this.get('posts');
        this.get('posts').push(postState);
        page(`/admin/${postState.id}/`);
    }
});

var adminDetail = component.extend({
    data: function() {
        return {
            post: {}
        };
    },
    template: `
        <h1>{{ post.title }}</h1>
        <edited-post-form post="{{ post }}" />
    `,
    components: {
        'edited-post-form': editedPostForm
    },
    oninit: function() {
        this.observe('id', function(value) {
            if (value) {
                this.getPost(value);
            }
        });
    },
    getPost: function(id) {
        this.set('post', posts.filter(function(v) { return v.id == id; })[0]);
    }
});

var newPost = component.extend({
    template: `
        <h1>New post</h1>
        <new-post-form />
    `,
    components: {
        'new-post-form': newPostForm
    }
});

var ractive = Ractive({
    el: '#root',
    template: `
        <main class="container-fluid">
          <a href="/">Home</a>
          <a href="/admin/">Admin</a>
          <router views="{{ views }}">
            <route path="/" component="home" />
            <route path="/:id(\\d+)/" component="post-detail" />
            <route path="/admin/" component="admin" />
            <route path="/admin/:id(\\d+)/" component="admin-detail" />
            <route path="/admin/new/" component="new-post">
          </router>
        </main>
    `,
    components: {
        router: router
    },
    data: {
        views: {
            home: home,
            admin: admin,
            'post-detail': postDetail,
            'admin-detail': adminDetail,
            'new-post': newPost
        }
    }
});