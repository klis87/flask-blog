var route = component.extend({
  oninit: function() {
    page(this.get('path'), function(ctx) {
      this.container.set('currentView', this.get('component'));
      this.root.set('currentPath', ctx.path);
      var id = ctx.params.id;
      if (id) this.container.setId(id);
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
        if (!!this.partials[name]) return name;
        this.partials[name] = `<${name} />`;
        return name;
      }
    };
  },
  onconfig: function() {
    $.extend(this.components, this.get('views'));
  },
  onrender: function() {
    page();
  },
  setId: function(id) {
    var currentView = this.findComponent(this.get('currentView'));
    currentView.set('id', id);
  }
});
