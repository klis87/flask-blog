var home = component.extend({
  data: function () {
    return {
      posts: []
    };
  },
  computed: {
    publishedPosts: function() {
      var posts = this.get('posts').filter(function(v) { return v.published; });

      return posts.sort(function (a, b) {
        if (a.publication_date < b.publication_date) return 1;
        if (a.publication_date > b.publication_date) return -1;
        return 0;
      });
    }
  },
  components: {
    panel: panel
  },
  template: `
    <div class="posts">
    {{#each publishedPosts}}
      <panel>
        {{#partial title}}
          <span class="pull-right">{{ publication_date }}</span>
          <h2 class="panel-title"><a href="/{{ id }}/">{{ title }}</a></h2>
        {{/partial}}
        {{#partial body}}
          {{ description }}
        {{/partial}}
      </panel>
    {{ else }}
      <p>There is no post added yet.</p>
    {{/each}}
    </div>
  `,
  oninit: function() {
    postsApi.fetch().then(function(posts) {
      this.set('posts', posts)
    }.bind(this));
  }
});

var postDetail = component.extend({
  template: `
    <div class="clearfix">
      <h1 class="pull-left">{{ post.title }}</h1>
      <span class="publication-date">{{ post.publication_date }}</span>
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
    this.observe('params.id', function(value) {
      if (value) this.getPost(value);
    });
  },
  getPost: function(id) {
    postsApi.fetchOne(id).then(function(post) {
      this.set('post', post);
    }.bind(this));
  }
});

var deletePostModal = component.extend({
  components: {
    modal: modal
  },
  template: `
    <modal id="delete-post-{{ post.id }}">
      {{#partial body}}
        <p>Are you sure you would like to delete post {{ post.title }}?</p>
      {{/partial}}
      {{#partial footer}}
        <button type="button" class="btn btn-primary" data-dismiss="modal">No</button>
        <button on-click="delete()" class="btn btn-danger" data-dismiss="modal"
                type="button">Yes</button>
      {{/partial}}
    </modal>
  `,
  delete: function() {
    var post = this.get('post');
    var posts = this.get('posts');
    postsApi.delete(post).then(function() {
      this.root.findComponent('alerts').addMessage(`Post ${post.title} has been deleted.`);
      page('/dashboard/');
      if (posts) {
        var index = posts.map(function(v) { return v.id; }).indexOf(post.id);
        posts.splice(index, 1);
      }
    }.bind(this));
  }
});

var dashboard = component.extend({
  data: function() {
    return {
      posts: []
    };
  },
  components: {
    panel: panel,
    'delete-post-modal': deletePostModal
  },
  template: `
    <div class="clearfix">
      <h1 class="pull-left">Dashboard</h1>
      <a class="btn btn-success pull-right header-btn btn" href="/dashboard/new/">New post</a>
    </div>
    <hr>
    {{#each posts: i}}
      <panel>
        {{#partial title}}
          <div class="pull-right">
            <a class="btn btn-primary btn-sm" href="/dashboard/{{ id }}/">Edit</a>
            <button class="btn btn-danger btn-sm" data-toggle="modal"
                    data-target="#delete-post-{{ id }}">Delete</button>
          </div>
          <h2 class="panel-title">{{ title }}</h2>
        {{/partial}}
        {{#partial body}}
          {{ description }}
        {{/partial}}
      </panel>
      <delete-post-modal post="{{ posts[i] }}" posts="{{ posts }}" />
    {{ else }}
      <p>There is no post added yet.</p>
    {{/each}}
  `,
  oninit: function() {
    postsApi.fetch().then(function(posts) {
      this.set('posts', posts)
    }.bind(this));
  }
});

var editedPostForm = component.extend({
  data: function() {
    return {
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
        <label for="short-description">Short description</label>
        <textarea id="short-description" value="{{ postState.description }}" class="form-control" required
                  maxlength="255"></textarea>
      </div>
      <div class="form-group">
        <label for="content">Content</label>
        <jqte value="{{ postState.content }}" required="{{ true }}" />
      </div>
      <div class="form-group">
        <label for="date">Publication date</label>
        <div style="position: relative;">
          <input type="text" class="form-control" id="date" decorator="datepicker"
                 value="{{ postState.publication_date }}" required>
        </div>
      </div>
      <div class="checkbox">
        <label>
          <input type="checkbox" checked="{{ postState.published }}" name="published"> Published
        </label>
      </div>
      <hr>
      <button class="btn btn-primary pull-right">Save</button>
      {{ yield }}
    </form>
  `,
  save: function() {
    var postState = this.get('postState');
    postsApi.edit(postState).then(function(post) {
      this.set('post', post);
      this.root.findComponent('alerts').addMessage(`Post ${postState.title} has been successfully edited.`);
    }.bind(this));
  }
});

var newPostForm = editedPostForm.extend({
  save: function() {
    var postState = this.get('postState');
    postsApi.add(postState).then(function(post) {
      this.root.findComponent('alerts').addMessage(`Post ${postState.title} has been successfully created.`);
      page(`/dashboard/${post.id}/`);
    }.bind(this));
  }
});

var dashboardDetail = component.extend({
  data: function() {
    return {
      post: {}
    };
  },
  template: `
    <h1>{{ post.title }}</h1>
    <hr>
    <edited-post-form post="{{ post }}">
      <button class="btn btn-danger btn pull-left" data-toggle="modal" type="button"
              data-target="#delete-post-{{ post.id }}">Delete</button>
      <delete-post-modal post="{{ post }}" />
    </edited-post-form>
  `,
  components: {
    'edited-post-form': editedPostForm,
    'delete-post-modal': deletePostModal
  },
  oninit: function() {
    this.observe('params.id', function(value) {
      if (value) this.getPost(value);
    });
  },
  getPost: function(id) {
    postsApi.fetchOne(id).then(function(post) {
      this.set('post', post);
    }.bind(this));
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

var root = Ractive({
  el: '#root',
  template: `
    <navbar currentPath="{{ currentPath }}" brand="RACTIVE BLOG">
      <link pattern="^/(\\d+/)?$" href="/" name="Home" />
      <link pattern="^/dashboard/" href="/dashboard/" name="Dashboard" />
    </navbar>
    <main class="container-fluid">
      <router views="{{ views }}">
        <route path="/" component="home" />
        <route path="/:id(\\d+)/" component="post-detail" />
        <route path="/dashboard/" component="dashboard" />
        <route path="/dashboard/:id(\\d+)/" component="dashboard-detail" />
        <route path="/dashboard/new/" component="new-post">
      </router>
    </main>
    <alerts />
  `,
  components: {
    router: router,
    route: route,
    navbar: navbar,
    link: link,
    alerts: alerts
  },
  data: {
    views: {
      home: home,
      dashboard: dashboard,
      'post-detail': postDetail,
      'dashboard-detail': dashboardDetail,
      'new-post': newPost
    }
  }
});
