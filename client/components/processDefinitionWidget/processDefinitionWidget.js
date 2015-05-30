Template.processDefinitionWidget.helpers({
    processDefinitionList: function() {
        return Session.get("processDefinitions");
    }
});

Template.processDefinitionWidget.events({
    'click .closeStartBox': function() {
         //$('.procdeflist').hide();
        Session.set("showStartBox", false);
    },
    'click #send': function() {
        log.info('start data: %s',  $('#startData').val());
        if ($('#startData').val() != '') {
            var id = $('#startData').val();
            Bpm.startProcessInstance(id);
            Bpm.refreshTaskList();
        }
        Session.set("showStartBox", false);
    }
});
