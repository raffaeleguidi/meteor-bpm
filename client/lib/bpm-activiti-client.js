function calculatePages(tasks) {
    var pages = new Array();
    var last = tasks.total / Bpm.size;
    for(n=0; n < last; n++) {
        pages.push(n+1);
    }
    return pages;
}

Bpm = {
    activitiHost: 'activiti',
    auth: 'kermit:kermit',
    start: 0,
    size: 2,

    refreshTaskList: function() {
//        console.log('client refreshTaskList');
        Meteor.call("refreshTaskList", this.start, this.size, function(err, res) {
            if (err) {
                console.log("errore: %s" , err.message);
            } else {
                Session.set('taskList', res);
                Session.set('pages', calculatePages(res));
                Session.set('lastUpdate', new Date());
            }
        });
//        console.log('end client refreshTaskList');
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

