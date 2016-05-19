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

var alert = component.extend({
    template: `
        <div class="alert alert-{{ type }}">
            <button type="button" class="close" on-click="close(index)"><span>&times;</span></button>
            {{ text }}
        </div>
    `,
    oninit: function() {
        this.close = this.get('onClose').bind(this.parent);
        this.timeoutId = setTimeout(function() {
            var index = this.get('index');
            this.close(index);
        }.bind(this), 4000);
    },
    onunrender: function() {
        clearTimeout(this.timeoutId);
    }
});

var alerts = component.extend({
    data: function() {
        return {
            messages: [],
            removeMessage: this.removeMessage
        };
    },
    components: {
        alert: alert
    },
    template: `
        <div class="alerts">
        {{#each messages: i}}
            <alert type="{{ type }}" text="{{ text }}" index="{{ i }}" onClose="{{ removeMessage }}"></alert>
        {{/each}}
        </div>
    `,
    addMessage: function(text, type) {
        type = type || 'success';
        var newMessage = {type: type, text: text};
        this.get('messages').push(newMessage);
    },
    removeMessage: function(index) {
        this.get('messages').splice(index, 1);
    }
});
