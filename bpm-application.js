Bpm = {
    activitiHost: '172.17.0.52',
    auth: 'kermit:kermit',
    start: 0,
    size: 10,

    refreshTaskList: function() {
        Meteor.call("refreshTaskList", this.start, this.size, function(err, res) {
            if (err) {
                console.log("errore: %s" , err.message);
            } else {
                Session.set('taskList', res);
                var pages = new Array();
                for(n=0; n < Session.get('taskList').total / Bpm.size; n++) {
                    pages.push(n+1);
                }
                Session.set('pages', pages);
                Session.set('lastUpdate', new Date());
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
    lastUpdate: function () {
      return Session.get('lastUpdate') ? Session.get('lastUpdate') : 'never';
    },
    counter: function () {
      return Session.get('taskList') ? Session.get('taskList').total : 0;
    },
    taskList: function() {
        return Session.get('taskList');
    },
    formData: function() {
        return Session.get('formData');
    },
    pages: function() {
        return Session.get("pages");
    },
    currentPage: function() {
        return Session.get('currentPage') ? Session.get('currentPage') : 1;
    }
  });

  Template.hello.events({
    'click button': function (evt) {
        Bpm.refreshTaskList();
    },
    'click .claim': function () {
        Bpm.formData(this.id);
    },
    'click .page': function (evt) {
        Bpm.start = ($(evt.target).attr('data-page')-1) * Bpm.size;
        Session.set('currentPage', $(evt.target).attr('data-page'));
        Bpm.refreshTaskList();
    }
  });
}

if (Meteor.isServer) {
    var activitiUrl = 'http://' + Bpm.activitiHost + ':8080/activiti-rest/service/';
    var options = { auth: Bpm.auth };

    Meteor.startup(function () {
        Meteor.methods({
            refreshTaskList: function (start, size) {
                options.params = {
                    start: start ? start : 0,
                    size: size
                };
                var res = HTTP.call("GET", activitiUrl + 'runtime/tasks', options);
                var content = JSON.parse(res.content);
                return content;
            },
            formData: function(taskId) {
                /*options.headers = {
                    "Content-Type": "application/json"
                };*/
                options.params = {
                    taskId: taskId
                };
                var res = HTTP.call("GET", activitiUrl + 'form/form-data', options);
                var content = JSON.parse(res.content);
                return content;
            }
        });
    });
}
