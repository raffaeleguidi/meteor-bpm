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
            console.log(evt.keyCode);
            //if (evt.target != document.body) return;
            switch(evt.keyCode) {
                case 82: $('.refresh').click(); return; // r
                case 67: return; // c
                case 13: $('.complete').click(); return; // enter key
            }
        });
    });
});
