Template.input_date.rendered = function(){
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
};

Template.input_enum.rendered = function(){
    $('.enum').change(function(evt){
        console.log($(evt.target).val());
        console.log($(evt.target).find('option:selected'));
    });
};

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
            case 'date':  return Template.input_date;
            case 'enum':  return Template.input_enum;
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
        var properties = _.map($('.formData'), function(elem){
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
