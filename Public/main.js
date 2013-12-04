define([
    'jquery',
    'underscore',
    'backbone',
    './Apps/Calendar/Views/Calendar',
    'moment'
], function ($, _, Backbone, CalendarView, moment) {

    console.log("MOMENT", moment);
    function checkReminders() {
        var now = new Date();
        var events = SmartBlocks.Blocks.Time.Data.events;
        for (var k in events.models) {
            var event = events.models[k];
            if (event.get("reminder")) {
                var reminder = event.get("reminder");
                var remind_start = new Date(event.getStart());
                remind_start.setMinutes(remind_start.getMinutes() - reminder.time);
                var remind_end = new Date(event.getStart());
                if (now > remind_start && now < remind_end && !reminder.seen) {

                    SmartBlocks.Blocks.Notifications.Main.notify("Reminder",
                        event.get('name') + " starts in " + Math.round((event.getStart().getTime() - now.getTime()) / 60000) + " minutes",
                        "event_reminder_" + event.get('id'),
                        {
                            ok: function () {
                                event.set("reminder", undefined);
                                event.save();
                            },
                            ignore: function () {
                                event.set("reminder", undefined);
                                event.save();
                            },
                            remind_me: function () {
                                var minutes_to_start = Math.round((event.getStart().getTime() - now.getTime()) / 60000) - 5;
                                if (minutes_to_start > 0) {
                                    reminder.time = minutes_to_start;
                                    reminder.seen = false;
                                }
                                event.save();
                            }
                        });
                    reminder.seen = true;


                }
            }
        }
    }

    var main = {
        custom_context_menu_items: [],
        notified: [],
        init: function () {
            var base = this;
            if (SmartBlocks.current_user.get('connected')) {
                setInterval(function () {
                    checkReminders();
                }, 1000);
            }


            SmartBlocks.events.on("ws_notification", function (message) {
                if (message.block == "Time") {
                    if (message.action == "saved_event") {
                        var event = new SmartBlocks.Blocks.Time.Models.Event(message.event);
                        event.fetch({}, {
                            success: function () {
                                SmartBlocks.Blocks.Time.Data.events.add(event, {merge: true});
                            }
                        });

                    }
                    if (message.action == "deleted_event") {
                        SmartBlocks.Blocks.Time.Data.events.remove(message.event.id);
                    }
                }
            });

            SmartBlocks.Blocks.Time.Main.moment = moment;
        },
        addEventContextMenuItem: function (name, callback) {
            var base = this;
            base.custom_context_menu_items.push({
                name: name,
                callback: callback
            });
        },
        launch_calendar: function (app) {
            var calendar_view = new CalendarView();
            SmartBlocks.Methods.render(calendar_view.$el);
            calendar_view.init(app);
        }
    };
    return main;
});