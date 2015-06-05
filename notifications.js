//notifications = new Meteor.Stream('server-notifications');

Notifications = new Mongo.Collection("notifications");

if (Meteor.isClient) {
    Template.registerHelper('notifications', function() {
         return Notifications.find({});
    });

    Tracker.autorun(function (c) {
        if (c.firstRun) {
            Session.set("lastNotification", new Date());
        }
        var cursor = Notifications.find({ time: {
                        $gt: Session.get("lastNotification").getTime()
                     }});
        /*  not needed, yet but it makes the tracker needs it to work */
        cursor.forEach(function(element){
            //log.info(element);
        });

        log.info('detected change: ' + new Date());

        var interval = 1000;
        if (new Date().getTime() - Session.get("taskList").lastUpdate.getTime() > interval) {
            Bpm.refreshTaskList(Session.get("taskList").currentPage || 1);
            Bpm.refreshInbox();
            log.info('refreshing');
            setTimeout(function() {
                UserInterface.refresh();
                log.info('refreshed');
            }, 1000);
        };

        log.info("last notification set to %s", Session.get("lastNotification"));
    });
}
