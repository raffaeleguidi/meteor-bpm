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

  Template.hello.events({
    'click .refresh': function (evt) {
        console.log('refresh');
        Bpm.refreshTaskList();
        Session.set("formData", undefined);
        return false;
    },
    'click .claim': function () {
        console.log('claim');
        Bpm.formData(this.id);
        return false;
    },
    'click .unselect': function () {
        console.log('unselect');
        Session.set('formData', undefined);
        return false;
    },
    'click .page': function (evt) {
        console.log('page');
        Bpm.start = ($(evt.target).attr('data-page')-1) * Bpm.size;
        Session.set('currentPage', $(evt.target).attr('data-page'));
        Bpm.refreshTaskList();
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
