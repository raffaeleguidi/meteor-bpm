Bpm = {
    activitiHost: 'activiti',
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
    },
    complete: function(taskId, properties, cb) {
        Meteor.call("complete", taskId, properties, function(err, res) {
            cb(err, res);
        });
    }
}


if (Meteor.isClient) {

    Bpm.refreshTaskList();

//    Template.registerHelper('thumbUrl', function(){
//        return Session.get("rootUrl") + "api/thumb/" + this._id + "?v=" + (this.version ? this.version : '0');
//    });


  Template.tasklistWidget.helpers({
    active: function(item) {
        return Session.get('currentPage') ? Session.get('currentPage') == item : item == 1;
    },
    counter: function () {
      return Session.get('taskList') ? Session.get('taskList').total : 0;
    },
    taskSelected: function() {
        console.log("eccomi %s, %s", JSON.stringify(Session.get('formData')), Session.get('formData') != null && Session.get('formData') != undefined);
        return Session.get('formData') != null && Session.get('formData') != undefined;
    },
    pages: function() {
        return Session.get("pages");
    },
    currentPage: function() {
        return Session.get('currentPage') ? Session.get('currentPage') : 1;
    }
  });

  Template.formWidget.helpers({
    formData: function() {
        return Session.get('formData');
    },
    currentTask: function() {
        return Session.get('currentTask');
    }
  });

  function reset(){
    console.log('reset');
    Bpm.start = 0;
    Session.set("currentPage", 1);
    Bpm.refreshTaskList();
    Session.set("formData", undefined);
  }

  Template.tasklistWidget.events({
    'click .refresh': function (evt) {
        reset();
    },
    'click .claim': function () {
        console.log('claim');
        Session.set('currentTask', this);
        Bpm.formData(this.id);
        window.location.hash = 'form';
        //return false;
    },
    'click .page': function (evt) {
        console.log('page');
        Bpm.start = ($(evt.target).attr('data-page')-1) * Bpm.size;
        Session.set('currentPage', $(evt.target).attr('data-page'));
        Bpm.refreshTaskList();
    }
  });

  Template.body.events({
    'click .page-title': function () {
        reset();
        return false;
    }
  });

  Template.registerHelper("lastUpdate", function () {
      return Session.get('lastUpdate') ? Session.get('lastUpdate') : 'never';
  });
  Template.registerHelper("taskList", function() {
        return Session.get('taskList');
  });

  Template.formWidget.events({
    'click .unselect': function () {
        console.log('unselect');
        Session.set('formData', undefined);
        return false;
    },
    'click .complete': function (evt) {
        console.log('complete');
        evt.preventDefault();
        var properties = _.map($('input.formData'), function(elem){
            return {
                id: $(elem).attr("data-property-id"),
                value: elem.value
            }
        });
        Bpm.complete(Session.get("formData").taskId, properties, function(err, res){
            if (err) {
                alert(err.message);
            } else {
                if (res.error) {
                    alert(res.error);
                } else {
                    Session.set('formData', undefined);
                }
            }
        });
        Bpm.refreshTaskList();
        return false;
    }
  });
}

if (Meteor.isServer) {
    var activitiUrl = 'http://' + Bpm.activitiHost + ':8080/activiti-rest/service/';
    var options = { auth: Bpm.auth, proxy: null };

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
                options.params = {
                    taskId: taskId
                };
                try {
                    var res = HTTP.call("GET", activitiUrl + 'form/form-data', options);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        var result = JSON.parse(res.content);
                        return result;
                    } else {
                        console.log('form/form-data returned %d', res.statusCode)
                        return {error: 'HTTP_' + res.statusCode, taskId: taskId, formProperties: []}
                    }
                } catch (ex) {
                    console.log('form/form-data returned exception %d', ex.message)
                    return {error: ex.message, taskId: taskId, formProperties: []}
                }
            },
            complete: function(taskId, properties) {
                options.headers = {
                    "Content-Type": "application/json"
                };
                options.params = {
                    taskId: taskId
                };
                options.data = {
                    taskId: parseInt(taskId),
                    properties: properties
                }
                console.log(JSON.stringify(options.data));
                try {
                    var res = HTTP.call("POST", activitiUrl + 'form/form-data', options);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        return { statusCode: res.statusCode};
                    } else {
                        console.log('form/form-data returned %d', res.statusCode)
                        return { error: 'HTTP_' + res.statusCode, statusCode: res.statusCode }
                    }
                } catch (ex) {
                    console.log('form/form-data returned exception %s', ex)
                    return { error: ex.message }
                }
            }
        });
    });
}
