var home = component.extend({
  data: function () {
    return {
      posts: posts
    };
  },
  computed: {
    publishedPosts: function() {
      var posts = this.get('posts').filter(function(v) { return v.published; });

      return posts.sort(function (a, b) {
        if (a.publicationDate < b.publicationDate) return 1;
        if (a.publicationDate > b.publicationDate) return -1;
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
          <span class="pull-right">{{ publicationDate }}</span>
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
  `
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
    this.observe('params.id', function(value) {
      if (value) this.getPost(value);
    });
  },
  getPost: function(id) {
    this.set('post', posts.filter(function(v) { return v.id == id; })[0]);
  }
});

var deletePostModal = component.extend({
  components: {
    modal: modal
  },
  template: `
    <modal id="{{ id }}">
      {{#partial body}}
        <p>Are you sure you would like to delete post {{ title }}?</p>
      {{/partial}}
      {{#partial footer}}
        <button type="button" class="btn btn-primary" data-dismiss="modal">No</button>
        <button on-click="delete(index)" class="btn btn-danger" data-dismiss="modal"
                type="button">Yes</button>
      {{/partial}}
    </modal>
  `,
  delete: function(index) {
    var posts = this.get('posts');
    var title = posts[index].title;
    posts.splice(index, 1);
    this.root.findComponent('alerts').addMessage(`Post ${title} has been deleted.`);
    page('/admin/');
  }
});

var dashboard = component.extend({
  data: function() {
    return {
      posts: posts
    };
  },
  components: {
    panel: panel,
    'delete-post-modal': deletePostModal
  },
  template: `
    <div class="clearfix">
      <h1 class="pull-left">Dashboard</h1>
      <a class="btn btn-success pull-right header-btn btn" href="/admin/new/">New post</a>
    </div>
    <hr>
    {{#each posts: i}}
      <panel>
        {{#partial title}}
          <div class="pull-right">
            <a class="btn btn-primary btn-sm" href="/admin/{{ id }}/">Edit</a>
            <button class="btn btn-danger btn-sm" data-toggle="modal"
                    data-target="#delete-post-{{ i }}">Delete</button>
          </div>
          <h2 class="panel-title">{{ title }}</h2>
        {{/partial}}
        {{#partial body}}
          {{ description }}
        {{/partial}}
      </panel>
      <delete-post-modal id="delete-post-{{ i }}" title="{{ title }}" index="{{ i }}" posts="{{ posts }}" />
    {{ else }}
      <p>There is no post added yet.</p>
    {{/each}}
  `
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
                 value="{{ postState.publicationDate }}" required>
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
    var posts = this.get('posts');
    var editedPostIndex = posts.map(function(v) { return v.id; }).indexOf(postState.id);
    this.set(`posts[${editedPostIndex}]`, postState);
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

var dashboardDetail = component.extend({
  data: function() {
    return {
      posts: posts
    };
  },
  computed: {
    index: function() {
      var id = parseInt(this.get('params.id'));
      var posts = this.get('posts');
      var postsIds = posts.map(function(v) { return v.id; });
      return postsIds.indexOf(id);
    },
    post: function() {
      var id = this.get('params.id');
      if (!id) return {};
      var posts = this.get('posts');
      return posts.filter(function(v) { return v.id == id; })[0];
    }
  },
  template: `
    <h1>{{ post.title }}</h1>
    <hr>
    <edited-post-form post="{{ post }}" posts="{{ posts }}">
      <button class="btn btn-danger btn pull-left" data-toggle="modal" type="button"
              data-target="#delete-post">Delete</button>
      <delete-post-modal id="delete-post" title="{{ post.title }}" index="{{ index }}" posts="{{ posts }}" />
    </edited-post-form>
  `,
  components: {
    'edited-post-form': editedPostForm,
    'delete-post-modal': deletePostModal
  }
});

var newPost = component.extend({
  data: function() {
    return {
      posts: posts
    };
  },
  template: `
    <h1>New post</h1>
    <hr>
    <new-post-form posts="{{ posts }}" />
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
