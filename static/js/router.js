var route = Ractive.extend({
    isolated: true,
    oninit: function() {
        //console.log('starting route', this.get('path'));

        page(this.get('path'), function(ctx) {
            this.parent.set('currentView', this.get('component'));
            //console.log('setting path', this.get('path'), this.get('component'), ctx);
            this.root.set('currentPath', ctx.path);

            var id = ctx.params.id;

            if (id) {
                this.parent.setId(id);
            }
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

                //console.log('setting view', name);

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
    },
    setId: function(id) {
        var currentView = this.findComponent(this.get('currentView'));
        currentView.set('id', id);
    }
});