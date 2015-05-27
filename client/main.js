Template.body.events({
    'click .page-title': function () {
        reset();
        return false;
    }
});

Template.registerHelper("lastUpdate", function () {
    return Session.get('lastUpdate') ? Session.get('lastUpdate') : 'never';
});
Template.registerHelper("taskList", function() {
    return Session.get('taskList');
});

Meteor.startup(function () {
    Bpm.refreshTaskList();
    $( document ).ready(function() {
    });
});
