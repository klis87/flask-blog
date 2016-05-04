var home = Ractive.extend({
    template: `
        <h1>Ractive blog</h1>
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

var route = Ractive.extend({
    isolated: true,
    oninit: function() {
        page(this.get('path'), function() {
            this.parent.set('currentView', this.get('component'));
        }.bind(this));
    }
});

var router = Ractive.extend({
    isolated: true,
    template: `
        {{>content}}
        {{>getComponent(currentView)}}
    `,
    data: function() {
        return {
            currentView: '',
            getComponent: function(name) {
                name = name || 'default';

                if (!!this.partials[name]) {
                    return name;
                }

                this.partials[name] = '<' + name + ' />';
                return name;
            }
        };
    },
    components: {
        route: route
    },
    onconfig: function() {
        $.extend(this.components, this.get('views'));
    },
    onrender: function() {
        page();
    }
});

var ractive = Ractive({
    el: '#root',
    template: `
        <main class="container-fluid">
            {{ name }}
          <a href="/">Home</a>
          <a href="/admin/">Admin</a>
          <router views="{{ views }}">
            <route path="/" component="home" />
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
            admin: admin
        }
    }
});