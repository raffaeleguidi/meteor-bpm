Template.formWidget.helpers({
    formData: function() {
        return Session.get('formData');
    },
    currentTask: function() {
        return Session.get('currentTask');
    },
    inputDisplay: function() {
        switch(this.type){
            case 'string':  return Template.input_string;
        }
        return Template.input_other;
    }
});

Template.formWidget.events({
    'click .unselect': function () {
        console.log('unselect');
        Session.set('formData', undefined);
        return false;
    },
    'click .complete': function (evt) {
        console.log('complete');
        evt.preventDefault();
        var properties = _.map($('input.formData'), function(elem){
            return {
                id: $(elem).attr("data-property-id"),
                value: elem.value
            }
        });
        Bpm.complete(Session.get("formData").taskId, properties, function(err, res){
            if (err) {
                alert(err.message);
            } else {
                if (res.error) {
                    alert(res.error);
                } else {
                    Session.set('formData', undefined);
                }
            }
        });
        Bpm.refreshTaskList();
        return false;
    }
});
