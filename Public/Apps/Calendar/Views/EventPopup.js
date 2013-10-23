define([
    'jquery',
    'underscore',
    'backbone',
    'text!../Templates/event_popup.html',
    'text!../Templates/task_chooser.html'
], function ($, _, Backbone, PlannedTaskPopupTemplate, task_chooser_tpl) {
    var View = Backbone.View.extend({
        tagName: "div",
        className: "event_popup",
        initialize: function (planned_task) {
            var base = this;
            base.planned_task = planned_task;
            base.events = $.extend({}, Backbone.Events);
        },
        init: function (e, event) {
            var base = this;
            base.posX = e.pageX;
            base.posY = e.pageY;

            base.event = event;

            base.render();
            base.registerEvents();
        },
        render: function () {
            var base = this;

            var template = _.template(PlannedTaskPopupTemplate, {
                planned_task: base.planned_task,
            });


            base.$el.html(template);


            $("body").prepend(base.$el);
            base.updatePosition();

            var value = base.$el.find('.activity').val();
//            var activity = SmartBlocks.Blocks.Organization.Data.activities.get(value);
//            if (activity) {
//                var template = _.template(task_chooser_tpl, {
//                    deadlines: activity.getDeadlines(),
//                    pt: base.planned_task
//                });
//                base.$el.find('.task_input').html(template);
//            } else {
//                base.$el.find('.task_input').html('<option value="0">None</option>');
//            }
        },
        scroll: function (e) {
            e.stopPropagation();
        },
        updatePosition: function () {
            var base = this;
            base.$el.css("top", base.posY);
            base.$el.css("left", base.posX - 200);
        },
        cancel: function () {
            var base = this;
            if (!base.planned_task.get("id")) {
                base.planned_task_view.$el.remove();
                base.$el.remove();
            } else {
                base.$el.remove();
            }
        },
        registerEvents: function () {
            var base = this;

            base.$el.mousedown(function (e) {
                if (e.which == 3) {
                    e.stopPropagation();
                    return false;
                }

            });

            base.$el.delegate('.activity', 'change', function () {
                var value = $(this).val();
//                var activity = SmartBlocks.Blocks.Organization.Data.activities.get(value);
//                if (activity) {
//                    var template = _.template(task_chooser_tpl, {
//                        deadlines: activity.getDeadlines(),
//                        pt: base.planned_task
//                    });
//                    base.$el.find('.task_input').html(template);
//                } else {
//                    base.$el.find('.task_input').html('<option value="0">None</option>');
//                }
            });

            base.$el.delegate(".save_button", "click", function () {
                var date = new Date(base.event.start);
                var hours = base.$el.find(".start_hour").val();
                var minutes = base.$el.find(".start_minute").val();
                date.setHours(hours, minutes, 0);
                base.planned_task.setStart(date);
                base.event.start = date;

                var end_hours = base.$el.find(".end_hour").val();
                var end_minutes = base.$el.find(".end_minute").val();
                var end_date = new Date(base.event.end);

                end_date.setHours(end_hours, end_minutes, 0);
                base.planned_task.setEnd(end_date);

                base.event.end = end_date;
                base.planned_task.set("name", base.$el.find(".name").val());

                var reminder_value = base.$el.find(".reminder").val();
                if (reminder_value == 1) {
                    base.planned_task.set("reminder", {
                        time: 0
                    });
                } else if (reminder_value == 2) {
                    base.planned_task.set("reminder", {
                        time: 15
                    });
                } else if (reminder_value == 3) {
                    base.planned_task.set("reminder", {
                        time: 60
                    });
                }

                base.event.title = base.planned_task.get("name");
                console.log(base.planned_task);
                if (base.planned_task.get("name") != "") {
                    base.$el.remove();
                    base.planned_task.save({}, {
                        success: function () {
                            base.events.trigger("saved", base.event);
                            console.log(base.planned_task);
                        }
                    });
                } else {
                    alert("You must provide a name");
                }
            });

            base.$el.find(".cancel_button").click(function () {
                base.cancel();
            });

            base.$el.find(".delete_button").click(function () {
                base.$el.remove();
                base.planned_task.destroy({
                    success: function () {
                        base.events.trigger("deleted");
                    }
                });
            });

        }
    });

    return View;
});