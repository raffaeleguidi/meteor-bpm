log.info('Bpm object initializing');

Bpm = {
    activitiUrl: 'http://localhost:8080/activiti-rest/service/',
    options: function(options) {
        if (!options) options = {};
        options.auth = this.user + ':' + this.password;
        return options;
    }
}

function authenticate() {
    Bpm.user = Meteor.user().username;
    Bpm.password = Meteor.user().username;
}

Meteor.startup(function () {
    log.info("bpm.js");
    Meteor.methods({
        /*
            variables parameter is optional and in the form of key-value json arra, like:
            "variables": [
                    {
                        "name": "employeeName",
                        "value": "Miss Piggy"
                    },
                    {
                        "name": "numberOfDays",
                        "value": "10"
                    }
        */
        startProcessInstanceById: function(processInstanceId, variables) {
        //POST runtime/process-instances/{processInstanceId}
            authenticate();
            var vars = [];

            if(variables && variables instanceof Array) {
                vars = variables;
            }
            var myOpts = {
                data: {
                    "processDefinitionId": processInstanceId,
                    "variables": vars
                },
                headers:{
                    "Content-Type":"application/json;charset=UTF-8"
                }
            }
            var options = Bpm.options(myOpts);

            var result = HTTP.call("POST", Bpm.activitiUrl + 'runtime/process-instances', options);
            
            if(!result) {
                log.error("Result from startProcessInstanceById is undefined");
                return {
                    err:"Result from startProcessInstanceById is undefined",
                    data:null
                };
            } else {
                //log.info("RESULT:"+JSON.stringify(result));
                if(result.err) {
                    log.error("Returning with error " + JSON.stringify(result.err));
                    return {
                      err: result.err,
                        data:null
                    };
                }

                return {
                    err: null,
                    data: result.data
                };
            }
        },
        processDefinitionStarterForm: function(processDefinitionId) {
            //GET form/form-data
            authenticate();
            var options = Bpm.options({
                "params": {
                    "processDefinitionId": processDefinitionId
                }
            });
            var res = HTTP.call("GET", Bpm.activitiUrl + 'form/form-data', options);
            var content = JSON.parse(res.content);

            return content;
        },
        refreshProcessDefinitions: function() {
            //GET repository/process-definitions
//            options.params = {
//                startableByUser: user
//            };
            authenticate();
            var options = Bpm.options({
                params: {
                    latest: true
                }
            });
            var res = HTTP.call("GET", Bpm.activitiUrl + 'repository/process-definitions', options);
            var content = JSON.parse(res.content);
            
//            log.info("List of startable process definitions: " + JSON.stringify(content));
            
            return content;
        },
        refreshTaskList: function (start, size) {
            authenticate();
            var options = Bpm.options({
                params: {
                    start: start ? start : 0,
                    size: size
//                    ,
//                    candidateUser: Bpm.user
                }
            });
            var res = HTTP.call("GET", Bpm.activitiUrl + 'runtime/tasks', options);
            var content = JSON.parse(res.content);
            return content;
        },
        refreshInbox: function (start, size) {
            authenticate();
            var options = Bpm.options({
                params: {
                    start: start ? start : 0,
                    size: size,
                    assignee: Bpm.user
                }
            });
            var res = HTTP.call("GET", Bpm.activitiUrl + 'runtime/tasks', options);
            var content = JSON.parse(res.content);
            return content;
        },
        getFormData: function(taskId) {
            authenticate();
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
                log.error('form/form-data returned exception %s', ex.message)
                return {error: ex.message, taskId: taskId, formProperties: []}
            }
        },
        complete: function(taskId, properties) {
            authenticate();
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
                return { error: ex }
            }
        },
        getInvolvedPeople: function(processInstanceId) {
            authenticate();
            var options = Bpm.options();
            try {
                var res = HTTP.call("GET", Bpm.activitiUrl +
                                    'runtime/process-instances/' +
                                    processInstanceId +
                                    '/identitylinks', options);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    var result = JSON.parse(res.content);
                    return result;
                } else {
                    log.warn('runtime/process-instances.../identitylinks returned %d', res.statusCode)
                    return { error: 'HTTP_' + res.statusCode, processInstanceId: processInstanceId }
                }
            } catch (ex) {
                log.error('runtime/process-instances.../identitylinks %s', ex.message)
                return { error: ex.message, processInstanceId: processInstanceId }
            }
        }
    });
});
