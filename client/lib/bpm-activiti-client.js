function calculatePages(tasks) {
    var pages = new Array();
    var last = tasks.total / Bpm.size;
    for(n=0; n < last; n++) {
        pages.push(n+1);
    }
    return pages;
}

function normalizeProperties(formElements) {
    return _.map(formElements, function(elem){
        var value = $(elem).val();
        if ($(elem).hasClass('date')) {
            console.log('click .complete: convert to a real date! the format is into the process definition');
            value = '2014-12-31';
        }
        console.log(new Date());
        return {
            id: $(elem).attr("data-property-id"),
            value: value
        }
    });
}

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
                Session.set('pages', calculatePages(res));
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
    complete: function(taskId, formElements, cb) {
        Meteor.call("complete", taskId, normalizeProperties(formElements), function(err, res) {
            cb(err, res);
        });
    },
    reset: function(){
        Bpm.start = 0;
        Session.set("currentPage", 1);
        this.refreshTaskList();
        Session.set("formData", undefined);
    }

}

