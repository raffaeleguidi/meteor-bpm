Restivus.configure({
    useAuth: false,
    prettyJson: true
});

Restivus.addRoute('test', {authRequired: false}, {
    get: function () {
        log.info("I'm getting a test call");
        return { jsonType: 'weird', data: 'response from api call'};
    }
});

/*
Restivus.addRoute('posts/:id', {authRequired: true}, {
    get: function () {
      var post = Posts.findOne(this.urlParams.id);
      if (post) {
        return {status: 'success', data: post};
      }
      return {
        statusCode: 404,
        body: {status: 'fail', message: 'Post not found'}
      };
    },
    post: {
      roleRequired: ['author', 'admin'],
      action: function () {
        var post = Posts.findOne(this.urlParams.id);
        if (post) {
          return {status: "success", data: post};
        }
        return {
          statusCode: 400,
          body: {status: "fail", message: "Unable to add post"}
        };
      }
    },
    delete: {
      roleRequired: 'admin',
      action: function () {
        if (Posts.remove(this.urlParams.id)) {
          return {status: "success", data: {message: "Item removed"}};
        }
        return {
          statusCode: 404,
          body: {status: "fail", message: "Item not found"}
        };
      }
    }
  });*/
