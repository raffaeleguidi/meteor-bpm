UserInterface = {
    refresh: function() {
        $('.collapsible').collapsible({
            accordion : false,
            expandable: true
        });
        $.each($('.check-visibility'), function(index, item) {
            //log.info('check-visibility %s visible %s', index, $(item).is(":visible"));
            if ($(item).is(":visible")) {
                var target= $('.open[data-task-id=' + $(item).attr("data-task-id")+ ']');
                Bpm.getFormData3($(item).attr("data-task-id"), function(err, res){
                    //$(evt.target).attr('data-form-initialized', true);
                    //log.info("formData_" + res.taskId);
                    Session.set('formData_' + res.taskId, res);
                });
            }
        });
    }
}
