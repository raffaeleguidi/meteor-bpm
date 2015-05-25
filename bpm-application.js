Bpm = {
    refreshTaskList: function() {
        Meteor.call("refreshTaskList", function(err, res) {
            if (err) {
              console.log("errore: %s" , err.message);
            } else {
              Session.set('taskList', res);
            }
        });
    },
    formData: function(taskId) {
        Meteor.call("formData", taskId, function(err, res) {
            if (err) {
              console.log("errore: %s" , err.message);
            } else {
              Session.set('formData', res);
            }
        });
    }
}


if (Meteor.isClient) {

  Bpm.refreshTaskList();

  Template.hello.helpers({
    counter: function () {
      return Session.get('taskList') ? Session.get('taskList').total : 0;
    },
    taskList: function() {
        return Session.get('taskList');
    },
    formData: function() {
        return Session.get('formData');
    }
  });

  Template.hello.events({
    'click button': function (evt) {
        Bpm.refreshTaskList();
    },
    'click .claim': function () {
        Bpm.formData(this.id);
    }
  });
}

if (Meteor.isServer) {
    var activiti = 'http://172.17.0.28:8080/activiti-rest/service/';
    var options = { auth: 'kermit:kermit' };
    Meteor.startup(function () {
        Meteor.methods({
            test: function () {
                 console.log('test');
            },
            refreshTaskList: function () {
                var res = HTTP.call("GET", activiti + 'runtime/tasks', options);
                var content = JSON.parse(res.content);
                return content;
            },
            formData: function(taskId) {
                console.log('Meteor.startup4');
                /*options.headers = {
                    "Content-Type": "application/json"
                };*/
                options.params = {
                    taskId: taskId
                };
                var res = HTTP.call("GET", activiti + 'form/form-data', options);
                var content = JSON.parse(res.content);
                return content;
            }
        });
    });
}
