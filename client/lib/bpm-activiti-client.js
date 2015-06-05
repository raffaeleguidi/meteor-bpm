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

Template.registerHelper('pending', function(date) {
    return parseInt(Session.get("pending"));
});

Template.registerHelper("taskList", function() {
    return Session.get('taskList');
});
Template.registerHelper("showStartBox", function() {
    return Session.get('showStartBox');
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
    size: 15,

    startProcessInstance: function(processInstanceId, variables) {
        pendingPlusOne();
        Meteor.call("startProcessInstanceById", processInstanceId, variables, function(err,result) {
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
    processDefinitionStarterForm: function(processDefinitionId) {
        pendingPlusOne();
        return Meteor.call("processDefinitionStarterForm", processDefinitionId, function(err, res) {
            pendingMinusOne();

            if (err) {
                log.error("errore: %s" , err.message);
            } else {
                Session.set("starterFormProperties", res);
                Meteor.flush();
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
    refreshTaskList: function(page, cb) {
        pendingPlusOne();
        if (page) {
            this.start = (page -1) * this.size;
        }
        Meteor.call("refreshTaskList", this.start, this.size, function(err, res) {
            pendingMinusOne();
            if (err) {
                log.error("errore: %s" , err.message);
                if (cb) cb(err, null);
            } else {
                var taskList = {
                    tasks : res,
                    pages: calculatePages(res),
                    currentPage: page ? page : 1,
                    lastUpdate: new Date()
                }
                // this is the land of confusion
                Session.set('taskList', taskList);

                UserInterface.refresh();

                // and this should be the normality

                if (cb) cb(null, taskList);
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
                var inbox = {
                    tasks : res,
                    pages: calculatePages(res),
                    currentPage: page ? page : 1,
                    lastUpdate: new Date()
                }
                Session.set('inbox', inbox);
            }
        });
    },
    getFormData3: function(taskId, cb) {
        pendingPlusOne();
        Meteor.call("getFormData", taskId, function(err, res) {
            pendingMinusOne();
            if (err) {
                log.error("errore: %s" , err.message);
                cb(err, null);
            } else {
                cb(null, res);
            }
        });
    },
    getFormData2: function(taskId) {
        pendingPlusOne();
        Meteor.call("getFormData", taskId, function(err, res) {
            pendingMinusOne();
            if (err) {
                log.error("errore: %s" , err.message);
            } else {
                Session.set('formData_' + taskId, res);
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
        this.refreshInbox();
        Session.set("currentTask", undefined);
        Session.set("formData", undefined);
    },
    clear: function() {
        Session.set("taskList", undefined);
        Session.set("inbox", undefined);
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
