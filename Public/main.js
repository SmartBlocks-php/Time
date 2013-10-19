define([
    'jquery',
    'underscore',
    'backbone',
    './Apps/Calendar/Views/Calendar'
], function ($, _, Backbone, CalendarView) {

    var main = {
        custom_context_menu_items: [],
        init: function () {
            var base = this;
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