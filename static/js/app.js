var component = Ractive.extend({
    isolated: true
});

var link = component.extend({
    template: `
        <li class="{{ isActive }}"><a href="{{ href }}">{{ name }}</a></li>
    `,
    computed: {
        isActive: function() {
            var pattern = new RegExp(this.get('pattern'));
            var currentPath = this.get('currentPath');

            if (currentPath === undefined) {
                return '';
            } else {
                return pattern.test(currentPath) ? 'active' : '';
            }
        }
    }
});

var navbar = component.extend({
    template: `
        <header>
            <nav class="navbar navbar-default">
                <div class="container-fluid">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#navbar-collapse" aria-expanded="false">
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                        <a class="navbar-brand" href="/">Ractive blog</a>
                    </div>
                    <div class="collapse navbar-collapse" id="navbar-collapse">
                        <ul class="nav navbar-nav">
                            {{ yield }}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    `,
    onrender: function() {
        this.observe('currentPath', function(currentPath) {
            this.findAllComponents('link').forEach(function(value) {
                value.set('currentPath', currentPath);
            });
        });
    }
});


var jqte = component.extend({
    data: function() {
        return {
            updated: false,
            required: false
        }
    },
    template: `
        <textarea value="{{ value }}"></textarea>
        {{#if required}}
            <input type="text" value="{{ value }}" required class="hide">
        {{/if}}
    `,
    onrender: function() {
        var node = $(this.find('textarea'));

        node.jqte({
            change: function() {
                this.set('value', node.val());
            }.bind(this)
        });

        this.observe('value', function(value) {
            if (value && !this.get('updated')) {
                this.set('updated', true);
                node.jqteVal(value);
            }
        }, {defer: true});
    }
});

var home = component.extend({
    template: `
        <h1>Ractive blog</h1>
        {{#each publishedPosts}}
          <div class="panel panel-default">
            <div class="panel-heading">
              <p class="pull-right">{{ publicationDate }}</p>
              <h2 class="panel-title"><a href="/{{ id }}/">{{ title }}</a></h2>
            </div>
            <div class="panel-body">{{{ content }}}</div>
          </div>
        {{/each}}
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
        <h1>{{ post.title }}</h1>
        <p>Published: {{ post.publicationDate }}</p>
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
        <h1>Admin panel</h1>
        <a class="btn btn-success" href="/admin/new/">New post</a>
        <hr>
        {{#each posts: i}}
          <div class="panel panel-default">
            <div class="panel-heading clearfix">
              <button on-click="remove(i)" class="btn btn-danger btn-sm pull-right">Remove</button>
              <h2 class="panel-title"><a href="/admin/{{ id }}/">{{ title }}</a></h2>
            </div>
            <div class="panel-body">{{{ content }}}</div>
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
                <input type="text" id="title" value="{{ postState.title }}" class="form-control" required>
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
        <navbar currentPath="{{ currentPath }}">
            <link pattern="^/(\\d+/)?$" href="/" name="Home" />
            <link pattern="^/admin/.*$" href="/admin/" name="Admin" />
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
    `,
    components: {
        router: router,
        navbar: navbar,
        link: link
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