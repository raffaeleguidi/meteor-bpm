Template.input_date.rendered = function(){
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year
        format: 'yyyy-mm-dd'
    });
};

Template.input_enum.rendered = function(){
    $('.enum').change(function(evt){
        /*console.log($(evt.target).val());
        console.log($(evt.target).find('option:selected'));*/
    });
};

Template.formWidget.helpers({
    formData: function() {
        return Session.get('formData');
    },
    currentTask: function() {
        return Session.get('currentTask');
    }
});

Template.formWidget.events({
    'click .unselect': function () {
        log.info('unselect');
        Session.set('formData', undefined);
        return false;
    },
    'click .complete': function (evt) {
        log.info('complete');
        evt.preventDefault();
        Bpm.complete(Session.get("formData").taskId, $('.formData'), function(err, res){
            if (err) {
                    log.error(err.message);
                    alert('error completing task');
            } else {
                if (res.error) {
                    alert('error completing task');
                    log.error(res.error);
                } else {
                    Bpm.refreshTaskList();
                }
            }
        });
        Bpm.reset();
        return false;
    },
    'change .weird': function (evt) {
        log.info('change weird');
        var field = $(evt.target).attr('data-field');
        var ref = $(evt.target).attr('data-ref');
        var prop = _.findWhere(
                        Session.get("formData").formProperties,
                        {id: field});
        var inputHidden = $('#form_' + field);
        var data = JSON.parse(inputHidden.val());
        data[ref] = $(evt.target).val();
        inputHidden.val(JSON.stringify(data));

    }
});
