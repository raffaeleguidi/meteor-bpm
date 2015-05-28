
Template.processDefinitionWidget.helpers({
    processDefinitionList: function() {
        return Session.get("processDefinitions");
    }
});

Template.processDefinitionWidget.events({
    'click .close': function() {
        this.hide();
    },
    'click #send': function() {
        log.info('start data: %s',  $('#startData').val());
        if ($('#startData').val() != '') {
            var id = $('#startData').val();
            
            Bpm.startProcessInstance(id);
        }
    }
});
