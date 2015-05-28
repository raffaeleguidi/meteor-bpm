log.info('Bpm object initializing');

var activitiUrl = 'http://activiti:8080/activiti-rest/service/';
var options = { auth: 'kermit:kermit', proxy: null };

// REINGEGNERIZZATELO!
var user     = 'kermit';

Meteor.startup(function () {
    log.info("bpm.js");
    Meteor.methods({
        startProcessInstance: function(processInstanceId) {
        //PUT runtime/process-instances/{processInstanceId}
            var res = HTTP.call("PUT", activitiUrl + 'runtime/process-instances/' + processInstanceId, options);
            var content = JSON.parse(res.content);
            
            console.log("Start process instance response: " + JSON.stringify(content));
            
            return content;
        },
        refreshProcessDefinitions: function() {
            //GET repository/process-definitions
//            options.params = {
//                startableByUser: user
//            };
            var res = HTTP.call("GET", activitiUrl + 'repository/process-definitions', options);
            var content = JSON.parse(res.content);
            
//            console.log("List of startable process definitions: " + JSON.stringify(content));
            
            return content;
        },
        refreshTaskList: function (start, size) {
            options.params = {
                start: start ? start : 0,
                size: size
            };
            var res = HTTP.call("GET", activitiUrl + 'runtime/tasks', options);
            var content = JSON.parse(res.content);
            return content;
        },
        getFormData: function(taskId) {
            options.params = {
                taskId: taskId
            };
            try {
                var res = HTTP.call("GET", activitiUrl + 'form/form-data', options);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    var result = JSON.parse(res.content);
                    return result;
                } else {
                    log.warn('form/form-data returned %d', res.statusCode)
                    return {error: 'HTTP_' + res.statusCode, taskId: taskId, formProperties: []}
                }
            } catch (ex) {
                log.error('form/form-data returned exception %d', ex.message)
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
            log.info(options.data);
            try {
                var res = HTTP.call("POST", activitiUrl + 'form/form-data', options);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    return { statusCode: res.statusCode};
                } else {
                    log.warn('form/form-data returned %s', res.statusCode)
                    return { error: 'HTTP_' + res.statusCode, statusCode: res.statusCode }
                }
            } catch (ex) {
                log.error('form/form-data returned exception %s', ex)
                return { error: ex.message }
            }
        }
    });
});
