var parsley = function(node, callback) {
    var instance = $(node).parsley();

    instance.on('form:success', function() {
        callback();
    });

    instance.on('form:submit', function() {
        return false;
    });

    return {
        teardown: function() {
            instance.destroy();
        }
    }
};
