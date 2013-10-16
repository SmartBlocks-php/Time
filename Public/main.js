define([
    'jquery',
    'underscore',
    'backbone',
    './Apps/Calendar/Views/Calendar'
], function ($, _, Backbone, CalendarView) {

    var main = {
        init: function () {

        },
        launch_calendar: function (app) {
            var calendar_view = new CalendarView();
            SmartBlocks.Methods.render(calendar_view.$el);
            calendar_view.init(app);
        }
    };
    return main;
});