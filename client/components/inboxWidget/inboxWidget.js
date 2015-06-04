Template.inboxWidget.onRendered(function () {
    log.info("onRendered");
    $('.collapsible').collapsible({
      accordion : false
    });
});

Template.inboxWidget.helpers({
    active: function(item) {
        return Session.get('taskList').currentPage ? Session.get('taskList').currentPage == item : item == 1;
    },
    counter: function () {
      return Session.get('taskList') ? Session.get('taskList').tasks.total : 0;
    },
    taskSelected: function() {
        return Session.get('formData') != null && Session.get('formData') != undefined;
    },
    pages: function() {
        return Session.get("taskList").pages;
    },
    currentPage: function() {
        return Session.get('taskList') ? Session.get('taskList').currentPage : 1;
    },
    previousPage: function() {
        var currentPage = parseInt(Session.get('taskList') ? Session.get('taskList').currentPage : 1);
        return currentPage > 1 ? currentPage -1 : 0;
    },
    nextPage: function() {
        var currentPage = parseInt(Session.get('taskList') ? Session.get('taskList').currentPage : 1);
        return currentPage < Session.get("taskList").pages.length ? currentPage + 1 : 0;
    }
});

Template.inboxWidget.events({
    'click .open': function (evt) {
        log.info('open');
        Session.set('currentTask', this);
        Bpm.getFormData2(this.id);
        $('body').focus();
        window.location.hash = 'form';
        // switch parent of form widget
//        var element = $('#innerFormWidget')
//        //element.detach();
//        var target = $('#form_' + $(evt.target).attr('data-task-id'));
//        //target.append(element);
//        element.hide();
//        setTimeout(function(){
//            element.css("position", "absolute");
//            target.animate({
//                height:element.height()
//            }, 100, function(){
//                element.animate({
//                    top: target.position().top
//                }, 0);
//                element.show();
//            });
//        }, 100);
    },
    'click .page': function (evt) {
        log.info("page %d", dataAttr);
        var dataAttr = parseInt($(evt.target).attr('data-page'));
        if (dataAttr == 0) return false;
        Bpm.refreshTaskList(dataAttr);
    }
});


