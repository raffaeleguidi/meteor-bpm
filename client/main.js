log.info("Bpm application started");


Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});

Deps.autorun(function () {
    if (Meteor.user()) {
        log.info('User logged in as %s', Meteor.user().username);
        setTimeout(function() { Bpm.reset(); }, 1000);
    } else {
        log.info('User is not logged in');
        Bpm.clear();
    }
});

Template.main.events({
    'click .refresh': function (evt) {
        Bpm.reset();
    },
    'click .create': function (evt) {
        Bpm.refreshProcessDefinitions();
        Session.set("showStartBox", true);
    },
    'click .page-title': function () {
        Bpm.reset();
        return false;
    },
    'keydown body': function(evt){
        //console.log(evt);
    }
});

Router.configure({layoutTemplate: 'main'});

Meteor.startup(function () {
    $( document ).ready(function() {
        $(document).on('keydown', function (evt) {
            /*log.info(evt.keyCode);
            log.info(evt.target);*/
            if (evt.target != document.body) return;
            switch(evt.keyCode) {
                case 82: $('.refresh').click(); return; // r
                case 67: $('.create').click(); return; // c
                case 13: if (!Session.get("currentTask")) {
                            $('.open').first().click();
                         } else $('.complete').click(); return; // enter key
                case 37: return; // left key
                case 39: return; // right key
            }
        });
    });
});

notifications.on('message', function(message, time) {
    log.info('detected change: ' + new Date());
    var interval = 1000;
    if (new Date().getTime() - Session.get("taskList").lastUpdate.getTime() > interval) {
        Bpm.refreshTaskList(Session.get("taskList").currentPage);
        Bpm.refreshInbox();
        log.info('refreshed');
    };
});
