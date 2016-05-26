var route = component.extend({
  oninit: function() {
    page(this.get('path'), function(ctx) {
      this.container.set('currentView', this.get('component'));
      this.container.set('params', ctx.params);
      this.parent.set('currentPath', ctx.path);
    }.bind(this));
  }
});

var router = component.extend({
  template: `
    {{ yield }}
    {{#if currentView}}
      {{>getComponent(currentView)}}
    {{/if}}
  `,
  data: function() {
    return {
      currentView: '',
      getComponent: function(name) {
        if (this.partials[name] === undefined) {
          this.partials[name] = `<${name} />`;
        }

        return name;
      }
    };
  },
  oninit: function() {
    this.components = this.get('views');

    this.observe('params', function(value) {
      var currentView = this.findComponent(this.get('currentView'));
      currentView.set('params', value);
    });
  },
  onrender: function() {
    page();
  }
});
