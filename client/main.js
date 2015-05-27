Template.body.events({
    'click .page-title': function () {
        reset();
        return false;
    },
    'keydown body': function(evt){
        console.log(evt);
    }
});

Template.registerHelper("lastUpdate", function () {
    return Session.get('lastUpdate');
});
Template.registerHelper("taskList", function() {
    return Session.get('taskList');
});

Meteor.startup(function () {
    Bpm.refreshTaskList();
    $( document ).ready(function() {
        $(document).on('keydown', function (evt) {
            if (evt.target != document.body) return;
            switch(evt.keyCode) {
                case 82: Bpm.reset(); return; // r
                case 67: return; // c
            }
        });
    });
});
