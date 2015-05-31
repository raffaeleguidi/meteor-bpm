Template.processDefinitionWidget.helpers({
    processDefinitionList: function() {
        return Session.get("processDefinitions");
    },
    processFormStarter: function() {
        return Session.get("starterFormProperties");
    }
});

Template.processDefinitionWidget.events({
    'click .closeStartBox': function() {
         //$('.procdeflist').hide();
        Session.set("showStartBox", false);
    },
    'change .startData': function() {
        var id = $('#startData').val();
        if (id != '' && id != undefined) {
//            console.log("Selected new proc def: " + id);
//            console.log("I'll load input form if necessary.");
            Bpm.processDefinitionStarterForm(id);
         }
    },
    'click #send': function() {
        log.info('start data: %s',  $('#startData').val());
        if ($('#startData').val() != '') {
            var id = $('#startData').val();
            var variables = [];

            var form = Session.get("starterFormProperties");

            for(i in form.formProperties) {
//                console.log("Get value for " + form.formProperties[i].id);
                var value = $("#formData_"+ form.formProperties[i].id).val();
//                console.log("found value " + (value));

                variables.push({ "name":form.formProperties[i].id, value:value});
            }

            Session.set("starterFormProperties",{});

            Bpm.startProcessInstance(id, variables);
            Bpm.refreshTaskList();
        }
        Session.set("showStartBox", false);
    }
});
