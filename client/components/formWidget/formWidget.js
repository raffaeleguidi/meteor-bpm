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
        console.log('unselect');
        Session.set('formData', undefined);
        return false;
    },
    'click .complete': function (evt) {
        console.log('complete');
        evt.preventDefault();
        Bpm.complete(Session.get("formData").taskId, $('.formData'), function(err, res){
            if (err) {
                alert(err.message);
            } else {
                if (res.error) {
                    alert(res.error);
                } else {
                    Bpm.refreshTaskList();
                }
            }
        });
        Bpm.reset();
        return false;
    },
    'change .weird': function (evt) {
        console.log('change weird');
        var field = $(evt.target).attr('data-field');
        var ref = $(evt.target).attr('data-ref');
        console.log(Session.get("formData").formProperties);
        var prop = _.findWhere(
                        Session.get("formData").formProperties,
                        {id: field});
        console.log('data field=%s', field);
        console.log('data ref=%s', ref);
        console.log("prop");
        console.log(prop);
        var inputHidden = $('#form_' + field);
        var data = JSON.parse(inputHidden.val());
        data[ref] = $(evt.target).val();
        inputHidden.val(JSON.stringify(data));
        console.log("data after");
        console.log(data);
        //Session.get("formData").formProperties[field].data[ref] = 'ciao';
/*
        var container = $('form_' + $(evt.target).attr('data-field'));
        console.log("evt");
        console.log(evt);
        console.log("this");
        console.log(this);
        console.log("container");
        console.log(container);
*/
    }
});
