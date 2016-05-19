var home = component.extend({
    template: `
        <div class="posts">
        {{#each publishedPosts}}
            <div class="panel panel-default">
                <div class="panel-heading">
                    <span class="pull-right">{{ publicationDate }}</span>
                    <h2 class="panel-title"><a href="/{{ id }}/">{{ title }}</a></h2>
                </div>
                <div class="panel-body">{{ description }}</div>
            </div>
        {{/each}}
        </div>
    `,
    oninit: function() {
        var publishedPosts = posts.filter(function(v) { return v.published; });
        this.set('publishedPosts', publishedPosts);
    },
    data: function() {
        return {
            publishedPosts: []
        };
    }
});

var postDetail = component.extend({
    template: `
        <div class="clearfix">
            <h1 class="pull-left">{{ post.title }}</h1>
            <span class="publication-date">{{ post.publicationDate }}</span>
        </div>
        <hr>
        <p>{{{ post.content }}}</p>
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
        <div class="clearfix">
            <h1 class="pull-left">Admin panel</h1>
            <a class="btn btn-success pull-right header-btn btn" href="/admin/new/">New post</a>
        </div>
        <hr>
        {{#each posts: i}}
            <div class="panel panel-default">
                <div class="panel-heading clearfix">
                    <div class="pull-right">
                        <a class="btn btn-primary btn-sm" href="/admin/{{ id }}/">Edit</a>
                        <button on-click="delete(i)" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                    <h2 class="panel-title">{{ title }}</h2>
                </div>
                <div class="panel-body">{{ description }}</div>
            </div>
        {{/each}}
    `,
    delete: function(index) {
        var posts = this.get('posts');
        var title = posts[index].title;
        posts.splice(index, 1);
        this.root.findComponent('alerts').addMessage(`Post ${title} has been deleted.`);
    }
});

var editedPostForm = component.extend({
    data: function() {
        return {
            posts: posts,
            post: {},
            save: this.save.bind(this)
        }
    },
    computed: {
        postState: function() {
            return $.extend({}, this.get('post'));
        }
    },
    decorators: {
        parsley: parsley,
        datepicker: datepicker
    },
    components: {
        jqte: jqte
    },
    template: `
        <form decorator="parsley: {{ save }}">
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" value="{{ postState.title }}" class="form-control" required
                       maxlength="60">
            </div>
            <div class="form-group">
                <label>Short description</label>
                <textarea value="{{ postState.description }}" class="form-control" required="true"
                          maxlength="255"></textarea>
            </div>
            <div class="form-group">
                <label>Content</label>
                <jqte value="{{ postState.content }}" required="{{ true }}" />
            </div>
            <div class="form-group">
                <label for="date">Publication date</label>
                <div style="position: relative;">
                    <input type="text" class="form-control" id="date" decorator="datepicker"
                           value="{{ postState.publicationDate }}" required>
                </div>
            </div>
            <div class="checkbox">
                <label>
                    <input type="checkbox" checked="{{ postState.published }}" name="published"> Published
                </label>
            </div>
            <button class="btn btn-primary pull-right">Save</button>
        </form>
    `,
    save: function() {
        var postState = this.get('postState');
        var posts = this.get('posts');
        var editedPostIndex = posts.map(function(v) { return v.id; }).indexOf(postState.id);
        this.set(`posts[${editedPostIndex}]`, postState);
        this.set('post', postState);
        this.root.findComponent('alerts').addMessage(`Post ${postState.title} has been successfully edited.`);
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
        this.root.findComponent('alerts').addMessage(`Post ${postState.title} has been successfully created.`);
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
        <hr>
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
        <hr>
        <new-post-form />
    `,
    components: {
        'new-post-form': newPostForm
    }
});

var ractive = Ractive({
    el: '#root',
    template: `
        <navbar currentPath="{{ currentPath }}">
            <link pattern="^/(\\d+/)?$" href="/" name="Home" />
            <link pattern="^/admin/.*$" href="/admin/" name="Admin panel" />
        </navbar>
        <main class="container-fluid">
          <router views="{{ views }}">
            <route path="/" component="home" />
            <route path="/:id(\\d+)/" component="post-detail" />
            <route path="/admin/" component="admin" />
            <route path="/admin/:id(\\d+)/" component="admin-detail" />
            <route path="/admin/new/" component="new-post">
          </router>
        </main>
        <alerts />
    `,
    components: {
        router: router,
        navbar: navbar,
        link: link,
        alerts: alerts
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