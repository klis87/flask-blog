Parsley.options.trigger = 'focusout';

var parsley = function (node, callback) {
  var instance = $(node).parsley();

  instance.on('form:success', function () {
    callback();
  });

  instance.on('form:submit', function () {
    return false;
  });

  return {
    teardown: function () {
      instance.destroy();
    }
  };
};

var datepicker = function (node) {
  var options = {
    format: 'YYYY-MM-DD',
    useCurrent: false
  };

  $(node).datetimepicker(options);

  return {
    teardown: function () {
      $(node).data('DateTimePicker').destroy();
    }
  };
};