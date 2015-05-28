log.info('Bpm object initializing');

var activitiUrl = 'http://activiti:8080/activiti-rest/service/';
var options = { auth: 'kermit:kermit', proxy: null };

Meteor.startup(function () {
    log.info("bpm.js");
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
            //console.log(JSON.stringify(options.data));
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
