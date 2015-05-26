Bpm = {
    activitiHost: 'activiti',
    auth: 'kermit:kermit',
    start: 0,
    size: 5,

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
    complete: function(taskId, properties) {
        Meteor.call("complete", taskId, properties, function(err, res) {
            if (err) {
              console.log("errore: %s" , err.message);
            } else {
                Session.set('formData', undefined);
            }
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
    lastUpdate: function () {
      return Session.get('lastUpdate') ? Session.get('lastUpdate') : 'never';
    },
    counter: function () {
      return Session.get('taskList') ? Session.get('taskList').total : 0;
    },
    taskList: function() {
        return Session.get('taskList');
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

  Template.tasklistWidget.events({
    'click .refresh': function (evt) {
        console.log('refresh');
        Bpm.start = 0;
        Session.set("currentPage", 1);
        Bpm.refreshTaskList();
        Session.set("formData", undefined);
        return false;
    },
    'click .claim': function () {
        console.log('claim');
        Session.set('currentTask', this);
        Bpm.formData(this.id);
        return false;
    },
    'click .page': function (evt) {
        console.log('page');
        Bpm.start = ($(evt.target).attr('data-page')-1) * Bpm.size;
        Session.set('currentPage', $(evt.target).attr('data-page'));
        Bpm.refreshTaskList();
    }
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
        //console.log("properties: %s", JSON.stringify(properties));
        Bpm.complete(Session.get("formData").taskId, properties);
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
                /*options.headers = {
                    "Content-Type": "application/json"
                };*/
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
