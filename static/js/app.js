var home = Ractive.extend({
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
    isolated: true,
    data: function() {
        return {
            posts: posts
        };
    }
});

var postDetail = Ractive.extend({
    template: `
        <h1>Post detail {{ id }}</h1>
    `
});


var admin = Ractive.extend({
    template: `
        <h1>Admin panel</h1>
        {{#each posts}}
          <div class="panel panel-default">
            <div class="panel-heading">
              <h3 class="panel-title">{{ title }}</h3>
            </div>
            <div class="panel-body">{{ content }}</div>
          </div>
        {{/each}}
    `,
    isolated: true,
    data: function() {
        return {
            posts: posts
        };
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
            'post-detail': postDetail
        }
    }
});