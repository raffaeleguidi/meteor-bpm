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
        console.log("eccomi %s, %s", JSON.stringify(Session.get('formData')), Session.get('formData') != null && Session.get('formData') != undefined);
        return Session.get('formData') != null && Session.get('formData') != undefined;
    },
    pages: function() {
        return Session.get("pages");
    },
    currentPage: function() {
        return Session.get('currentPage') ? Session.get('currentPage') : 1;
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
        console.log('page');
        Bpm.start = ($(evt.target).attr('data-page')-1) * Bpm.size;
        Session.set('currentPage', $(evt.target).attr('data-page'));
        Bpm.refreshTaskList();
    }
});


