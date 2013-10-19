define([
    'jquery',
    'underscore',
    'backbone',
    'text!../Templates/calendar.html',
    'ContextMenuView'
], function ($, _, Backbone, calendar_template, ContextMenu) {
    var View = Backbone.View.extend({
        tagName: "div",
        className: "calendar_calendar",
        initialize: function () {
            var base = this;
        },
        init: function () {
            var base = this;
            base.events = SmartBlocks.Blocks.Time.Data.events;
            console.log("time data", SmartBlocks.Blocks.Time.Data);
            base.render();
        },
        render: function () {
            var base = this;

            var template = _.template(calendar_template, {});
            base.$el.html(template);
            base.renderCalendar();
            base.registerEvents();
        },
        renderCalendar: function () {
            var base = this;
            var now = new Date();
            now.setHours(10);
            var end = new Date();
            end.setHours(11);

            base.events = [];
            for (var k in SmartBlocks.Blocks.Time.Data.events.models) {
                var event = SmartBlocks.Blocks.Time.Data.events.models[k];
                var start = event.getStart();
                var end = event.getEnd();

                var event = {
                    title: event.get('name'),
                    start: start,
                    end: end,
                    allDay: false,
                    id: event.get("id"),
                    className: "event_cal pt_event" + event.get('id'),
                    color: "gray"
                };
                base.events.push(event);
            }
            console.log(base.events);
            base.$el.find('.calendar_container').html("");
            base.$el.find('.calendar_container').fullCalendar({
                header: {
                    left: '',
                    center: '',
                    right: ''
                },
                height: 650,
                editable: true,
                droppable: true,
                events: base.events,
                defaultView: "agendaWeek",
                allDaySlot: false,
                drop: function (date, allDay, jsEvent, ui) { // this function is called when something is dropped

                    // retrieve the dropped element's stored Event Object
                    var originalEventObject = $(this).data('eventObject');

                    // we need to copy it, so that multiple events don't have a reference to the same object
                    var copiedEventObject = $.extend({}, originalEventObject);

                    // assign it the date that was reported
                    copiedEventObject.start = date;
                    if (allDay) {
                        date.setHours(12);
                    }
                    var end = new Date(date);

                    end.setHours(end.getHours() + 1);
                    copiedEventObject.end = end;
                    copiedEventObject.allDay = false;
                    copiedEventObject.editable = true;

                    // render the event on the calendar
                    // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)


                    var event = new PlannedTask();
                    var task = base.parent.tasks.get($(this).attr("id"));
                    event.setStart(date);
                    event.set("duration", 3600000);
                    event.set("content", task.get("name"));
                    event.set("task", task);
                    event.save({}, {
                        success: function () {
                            copiedEventObject.id = event.get("id");
                            copiedEventObject.color = "gray";
                            copiedEventObject.className = "event_cal pt_event" + event.get('id');
                            base.$el.find('.calendar_container').fullCalendar('renderEvent', copiedEventObject);
                            base.events.add(event);
                            base.parent.events.trigger("updated_event", event);
                        }
                    });


                },
                eventDrop: function (event, jsEvent, ui, view) {
                    var event = base.events.get(event.id);
                    if (event) {
                        event.setStart(event.start);

                        event.save();

                    }

                },
                eventResize: function (event) {
                    var event = base.events.get(event.id);

                    if (event) {
                        event.setStart(event.start);
                        event.set("duration", event.end.getTime() - event.start.getTime());


                        event.save({}, {
                            success: function () {
                                base.parent.events.trigger("updated_event");
                            }
                        });

                    }

                },
                eventClick: function (event, e) {
                    var elt = $(this);

                    base.$el.find(".selected_event").removeClass("selected_event");
                    elt.addClass("selected_event");

                    base.selected_pt = SmartBlocks.Blocks.Time.Data.events.get(event.id);
                },
                dayClick: function (date, allDay, jsEvent, view) { // Creation of events on click

                    var end = new Date(date);
                    end.setHours(date.getHours() + 1);
                    var event = new SmartBlocks.Blocks.Time.Models.Event();
                    event.setStart(date);
                    event.setEnd(end);
                    event.set("name", "New event");
                    event.set("description", "");
                    console.log(event);
                    SmartBlocks.Blocks.Time.Data.events.add(event);
                    var newEvent = {
                        title: event.get('name'),
                        start: date,
                        id: "noid",
                        allDay: allDay,
                        end: end,
                        className: "event_cal pt_event" + event.get('id'),
                        color: "rgba(50,50,50,0.3)"
                    };
                    base.$el.find('.calendar_container').fullCalendar('renderEvent', newEvent);
                    event.save({}, {
                        success: function () {
                            console.log(event);
                            console.log(event.getStart(), event.getEnd());
                        }
                    });
                },
                eventRender: function (event, element) {
                    var elt = $(element);
                    elt.addClass("event_evt_" + event.id);
                    elt.attr("data-id", event.id);
                    elt.attr("oncontextmenu", "return false;");
                    elt.mouseup(function (e) {
                        var elt = $(this);
                        var event = SmartBlocks.Blocks.Time.Data.events.get(elt.attr('data-id'));
                        if (e.which == 3) {
                            var context_menu = new ContextMenu();
                            context_menu.addButton("Edit", function () {
                                $(".event_popup").remove();
                                if (event) {
                                    var popup = new PlannedTaskPopup(event);
                                    popup.init(base.SmartBlocks, e, event);

                                    popup.events.on("deleted", function () {
                                        base.$el.find('.calendar_container').$el.fullCalendar('removeEvents', event.id)
                                        base.parent.events.trigger("updated_event");
                                    });
                                    popup.events.on("saved", function (event) {
                                        base.$el.find('.calendar_container').fullCalendar('updateEvent', event)
                                        base.parent.events.trigger("updated_event");
                                    });
                                }
                            });

                            for (var k in SmartBlocks.Blocks.Time.Main.custom_context_menu_items) {
                                var item = SmartBlocks.Blocks.Time.Main.custom_context_menu_items[k];
                                context_menu.addButton(item.name, function () {
                                    if (event) {
                                        item.callback(event);
                                    }
                                });
                            }
                            context_menu.addButton("Delete", function () {
                                if (event) {
                                    event.destroy({
                                        success: function () {
                                            console.log("destroyed event");
                                        }
                                    });
                                }
                            });
                            context_menu.show(e);
                        }

                    });
                },
                viewDisplay: function (view) {

                }
            });
        },
        registerEvents: function () {
            var base = this;

            SmartBlocks.Blocks.Time.Data.events.on("change", function (model) {
                base.updateEvent(model);
                if (base.selected_pt) {
                    if (base.$el.find(".selected_event").length > 1) {
                        base.$el.find(".selected_event").removeClass("selected_event");
                    }
                    base.$el.find(".pt_event" + model.get('id')).addClass("selected_event");
                }
            });
        },
        updateEvent: function (model) {
            var base = this;
            var base = this;
            base.$el.find('.calendar_container').fullCalendar('removeEvents', [model.get('id')]);
            base.$el.find('.calendar_container').fullCalendar('removeEvents', ["noid"]);

            var newEvent = {
                title: model.get('name'),
                start: model.getStart(),
                id: model.get("id"),
                allDay: false,
                end: model.getEnd(),
                color: "gray",
                className: "planned_task_cal pt_event" + model.get('id')
            };
            base.$el.find('.calendar_container').fullCalendar('renderEvent', newEvent);
        }

    });

    return View;
});