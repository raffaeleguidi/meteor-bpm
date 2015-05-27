function reset(){
    console.log('reset');
    Bpm.start = 0;
    Session.set("currentPage", 1);
    Bpm.refreshTaskList();
    Session.set("formData", undefined);
}

Template.tasklistWidget.helpers({
    active: function(item) {
        return Session.get('currentPage') ? Session.get('currentPage') == item : item == 1;
    },
    counter: function () {
      return Session.get('taskList') ? Session.get('taskList').total : 0;
    },
    taskSelected: function() {
        return Session.get('formData') != null && Session.get('formData') != undefined;
    },
    pages: function() {
        return Session.get("pages");
    },
    currentPage: function() {
        return Session.get('currentPage') ? Session.get('currentPage') : 1;
    },
    previousPage: function() {
        var currentPage = parseInt(Session.get('currentPage') ? Session.get('currentPage') : 1);
        return currentPage > 1 ? currentPage -1 : 0;
    },
    nextPage: function() {
        var currentPage = parseInt(Session.get('currentPage') ? Session.get('currentPage') : 1);
        return currentPage < Session.get("pages").length ? currentPage + 1 : 0;
    }
});

Template.tasklistWidget.events({
    'click .refresh': function (evt) {
        reset();
    },
    'click .claim': function () {
        console.log('claim');
        Session.set('currentTask', this);
        Bpm.formData(this.id);
        window.location.hash = 'form';
        //return false;
    },
    'click .page': function (evt) {
        var dataAttr = $(evt.target).attr('data-page');
        if (dataAttr == 0) return false;
        Bpm.start = ($(evt.target).attr('data-page')-1) * Bpm.size;
        Bpm.refreshTaskList();
        Session.set('currentPage', parseInt($(evt.target).attr('data-page')))
    }
});


