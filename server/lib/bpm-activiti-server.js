log.info('Bpm object initializing');

Bpm = {
    activitiUrl: 'http://activiti:8080/activiti-rest/service/',
    user: 'kermit',
    password: 'kermit',
    options: function(options) {
        if (!options) options = {};
        options.auth = this.user + ':' + this.password;
        return options;
    }
}

Meteor.startup(function () {
    log.info("bpm.js");
    Meteor.methods({
        startProcessInstance: function(processInstanceId) {
        //PUT runtime/process-instances/{processInstanceId}
            var res = HTTP.call("PUT", Bpm.activitiUrl + 'runtime/process-instances/' + processInstanceId, Bpm.options());
            var content = JSON.parse(res.content);
            
            log.info("Start process instance response: " + JSON.stringify(content));
            
            return content;
        },
        refreshProcessDefinitions: function() {
            //GET repository/process-definitions
//            options.params = {
//                startableByUser: user
//            };
            var res = HTTP.call("GET", Bpm.activitiUrl + 'repository/process-definitions', Bpm.options());
            var content = JSON.parse(res.content);
            
//            log.info("List of startable process definitions: " + JSON.stringify(content));
            
            return content;
        },
        refreshTaskList: function (start, size) {
            var options = Bpm.options({
                params: {
                    start: start ? start : 0,
                    size: size
                }
            });
            var res = HTTP.call("GET", Bpm.activitiUrl + 'runtime/tasks', options);
            var content = JSON.parse(res.content);
            return content;
        },
        getFormData: function(taskId) {
            var options = Bpm.options({
                params : {
                    taskId: taskId
                }
            });
            try {
                var res = HTTP.call("GET", Bpm.activitiUrl + 'form/form-data', options);
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
            var options = Bpm.options({
                headers: {
                    "Content-Type": "application/json"
                },
                params: {
                    taskId: taskId
                },
                data: {
                    taskId: parseInt(taskId),
                    properties: properties
                }
              });
            try {
                var res = HTTP.call("POST", Bpm.activitiUrl + 'form/form-data', options);
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
