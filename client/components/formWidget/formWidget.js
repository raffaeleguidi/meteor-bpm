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
    },
    showBorder: function() {
        return true;
    }
});

Template.innerFormWidget.helpers({
    formData: function() {
        return Session.get('formData_' + this.id);
    },
    currentTask: function() {
        return Session.get('currentTask');
    },
    showBorder: function() {
        return true;
    }
});

Template.innerFormWidget.events({
    'click .unselect': function () {
        log.info('unselect');
        Session.set('formData', undefined);
        return false;
    },
    'click .complete': function (evt) {
        log.info('complete');
        evt.preventDefault();
        var errors = new Array();
        var taskId = $(evt.target).attr("data-task-id");
        console.log(taskId);
        var inputs = $('form[data-task-id=' + taskId + '] :input.formData');
        /*log.info(inputs);
        return;*/
        inputs.each(function(index, value){
            log.info('field %s: "%s", required=%s, empty=%s', $(value).attr('data-property-id'), $(value).val(), $(value).hasClass('required'), $(value).val() == null);
            if ($(value).hasClass('required') && ($(value).val() == null || $(value).val().trim() == '' ) ) {
                errors.push({ id: $(value).attr('data-property-id'), name: $(value).attr('data-property-name'), message: 'is required and cannot be empty' });
            }
        });
        if (errors.length > 0) {
            _.each(errors, function(item){
                Materialize.toast('&laquo;' + item.name + '&raquo; ' + item.message, 2000, 'rounded'); // 4000 is the duration of the toast
            });
            return;
        }
        var taskName = Session.get("currentTask").name;
        var currentTask = {
            id: taskId
        }
        Bpm.complete(taskId, inputs, function(err, res){
            if (err) {
                    log.error(err.message);
                    Materialize.toast('Error completing task &laquo;' + taskName + '&raquo;', 4000, 'rounded')
            } else {
                if (res.error) {
                    Materialize.toast('Error completing task &laquo;' + taskName + '&raquo;', 4000, 'rounded')
                } else {
                    Materialize.toast('Task &laquo;' + taskName + '&raquo; completed', 4000, 'rounded')
                    Bpm.refreshTaskList(null, function(err, res) {
                        $('.collapsible').collapsible({
                          accordion : false
                        });
                        $.each($('.check-visibility'), function(index, item) {
                            log.info('check-visibility %s visible %s', index, $(item).is(":visible"));
                            if ($(item).is(":visible")) {
                                var target= $('.open[data-task-id=' + $(item).attr("data-task-id")+ ']');
                                Bpm.getFormData3($(item).attr("data-task-id"), function(err, res){
                                    $(evt.target).attr('data-form-initialized', true);
                                    log.info("formData_" + res.taskId);
                                    Session.set('formData_' + res.taskId, res);
                                });
                            }
                        });
                    });
                    Bpm.refreshInbox();
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
