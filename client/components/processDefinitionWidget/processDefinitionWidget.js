
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
        console.log('rrr:' + $('#formData').val());
        if ($('#formData').val() != '') {
            var id = $('#formData').val();
            
            Bpm.startProcessInstance(id);
        }
    }
});