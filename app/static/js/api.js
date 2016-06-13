var postsApi = {
  fetch: function() {
    return $.get('/api/post').then(function(response) {
      return response.objects;
    });
  },
  fetchOne: function(id) {
    return $.get(`/api/post/${id}`).then(function(response) {
      return response;
    });
  },
  add: function(post) {
    return $.ajax({
      url: '/api/post',
      method: 'POST',
      data: JSON.stringify(post),
      contentType: 'application/json'
    }).then(function(response) {
      return response;
    });
  },
  edit: function(post) {
    return $.ajax({
      url: `/api/post/${post.id}`,
      method: 'PUT',
      data: JSON.stringify(post),
      contentType: 'application/json'
    }).then(function(response) {
      return response;
    });
  },
  delete: function(post) {
    return $.ajax({
      url: `/api/post/${post.id}`,
      method: 'DELETE',
      contentType: 'application/json'
    }).then(function(response) {
      return response;
    });
  }
};