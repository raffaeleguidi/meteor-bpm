log.info('Bpm object initializing');

Template.registerHelper('formatDate', function(date) {
  return moment(date).format('YYYY-MM-DD');
});

Template.registerHelper('formatHour', function(date) {
  return moment(date).format('YYYY-MM-DD HH:mm.ss');
});

Template.registerHelper('loading', function(date) {
    return parseInt(Session.get("pending")) > 0;
});

Template.registerHelper("taskList", function() {
    return Session.get('taskList');
});
Template.registerHelper("inbox", function() {
    return Session.get('inbox');
});
Template.registerHelper("inboxCount", function() {
    return Session.get('inboxCount');
});
Template.registerHelper("serialize", function(obj) {
    return JSON.stringify(obj);
});

Template.registerHelper("inputType", function() {
    switch(this.type){
        case 'string':  if (this.id.indexOf('_json')>=0) {
                            this.type = 'json';
                            try {
                                this.data = JSON.parse(this.value);
                                if (this.data.jsonType) {
                                    if (Template["input_" + this.data.jsonType])
                                        return Template["input_" + this.data.jsonType];
                                }
                            } catch(ex) {
                                log.error(ex.message);
                            }
                            //console.log(this);
                            return Template.input_json;
                        } else {
                            return Template.input_string;
                        };
        case 'long':  return Template.input_string;
        case 'date':  return Template.input_date;
        case 'enum':  return Template.input_enum;
    }
    return Template.input_other;
});

function pendingPlusOne() {
    if (!Session.get("pending")) Session.set("pending", 0);
    // spinning wheel activates onl after 200 msecs
    setTimeout(function() {
        Session.set("pending", parseInt(Session.get("pending"))+1);
    }, 200);
}
function pendingMinusOne() {
    Session.set("pending", parseInt(Session.get("pending"))-1);
}


Bpm = {
    activitiHost: 'activiti',
    auth: 'kermit:kermit',
    start: 0,
    size: 10,

    startProcessInstance: function(processInstanceId) {
        pendingPlusOne();
        Meteor.call("startProcessInstanceById", processInstanceId, function(err,result) {
            pendingMinusOne();
            if(err) {
                log.error("errore: " + err);
            } else if (result.err) {
                log.error("errore: " + result.err);
            } else {
                log.info("starting instance of procDef " + JSON.stringify(result.data));
            }
        });        
    },
    refreshProcessDefinitions: function() {
        pendingPlusOne();
        Meteor.call("refreshProcessDefinitions", function(err, res) {
            pendingMinusOne();
            if (err) {
                log.error("errore: %s" , err.message);
            } else {
//                console.log("setting procDef " + JSON.stringify(res));
                Session.set('processDefinitions', res.data);
            }
        });       
    },
    refreshTaskList: function(page) {
        pendingPlusOne();
        if (page) {
            this.start = (page -1) * this.size;
        }
        Meteor.call("refreshTaskList", this.start, this.size, function(err, res) {
            pendingMinusOne();
            if (err) {
                log.error("errore: %s" , err.message);
            } else {
                var taskList = {
                    tasks : res,
                    pages: calculatePages(res),
                    currentPage: page ? page : 1,
                    lastUpdate: new Date()
                }
                Session.set('taskList', taskList);
            }
        });
    },
    refreshInbox: function(page) {
        pendingPlusOne();
        if (page) {
            this.start = (page -1) * this.size;
        }
        Meteor.call("refreshInbox", this.start, this.size, function(err, res) {
            pendingMinusOne();
            if (err) {
                log.error("errore: %s" , err.message);
            } else {
//                log.info('refreshInbox received');
                var inbox = {
                    tasks : res,
                    pages: calculatePages(res),
                    currentPage: page ? page : 1,
                    lastUpdate: new Date()
                }
//                log.info(res);
                Session.set('inbox', inbox);
            }
        });
    },
    getFormData: function(taskId) {
        pendingPlusOne();
        Meteor.call("getFormData", taskId, function(err, res) {
            pendingMinusOne();
            if (err) {
              log.error("errore: %s" , err.message);
            } else {
              Session.set('formData', res);
            }
        });
    },
    complete: function(taskId, formElements, cb) {
        pendingPlusOne();
        Meteor.call("complete", taskId, normalizeProperties(formElements), function(err, res) {
            pendingMinusOne();
            cb(err, res);
        });
    },
    reset: function(){
        Bpm.start = 0;
        this.refreshTaskList();
        Session.set("currentTask", undefined);
        Session.set("formData", undefined);
    }

}

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
        return {
            id: $(elem).attr("data-property-id"),
            value: value
        }
    });
}
