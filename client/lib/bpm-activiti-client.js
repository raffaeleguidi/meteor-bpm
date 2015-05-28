log.info('Bpm object initializing');

Template.registerHelper("lastUpdate", function () {
    return Session.get('lastUpdate');
});
Template.registerHelper("taskList", function() {
    return Session.get('taskList');
});
Template.registerHelper("serialize", function(obj) {
    return JSON.stringify(obj);
});

Template.registerHelper("inputType", function() {
    //console.log(this);
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
                                console.log(ex.message);
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

Bpm = {
    activitiHost: 'activiti',
    auth: 'kermit:kermit',
    start: 0,
    size: 10,

    startProcessInstance: function() {
        Meteor.call("startProcessInstance", function(err, res) {
            if (err) {
                console.log("errore: %s" , err.message);
            } else {
                console.log("starting instance of procDef " + JSON.stringify(res));
            }
        });        
    },
    refreshProcessDefinitions: function() {
        Meteor.call("refreshProcessDefinitions", function(err, res) {
            if (err) {
                console.log("errore: %s" , err.message);
            } else {
//                console.log("setting procDef " + JSON.stringify(res));
                Session.set('processDefinitions', res.data);
            }
        });       
    },
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
