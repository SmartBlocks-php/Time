define([
    'jquery',
    'underscore',
    'backbone',
    'text!../Templates/calendar.html'
], function ($, _, Backbone, calendar_template) {
    var View = Backbone.View.extend({
        tagName: "div",
        className: "calendar_calendar",
        initialize: function () {
            var base = this;
        },
        init: function () {
            var base = this;
            base.events = SmartBlocks.Blocks.Calendar.Data.events;

            base.render();
        },
        render: function () {
            var base = this;

            var template = _.template(calendar_template, {});
            base.$el.html(template);
            base.renderCalendar();
        },
        renderCalendar : function () {
            var base = this;
            var now = new Date();
            now.setHours(10);
            var end = new Date();
            end.setHours(11);

            base.events = [];
            for (var k in base.events.models) {
                var event = base.events.models[k];
                var start = event.getStart();
                var end = new Date(start);
                var duration = parseInt(event.get("duration"));
                end.setTime(end.getTime() + duration);
                var event = {
                    title: event.get("content") ? event.get("content") : "Untitled",
                    start: start,
                    end: end,
                    allDay: false,
                    id: event.get("id"),
                    className: "event_cal pt_event" + event.get('id'),
                    color: "gray"
                };
                base.events.push(event);
            }
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
                            base.$el.fullCalendar('renderEvent', copiedEventObject);
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

                    base.selected_pt = SmartBlocks.Blocks.Calendar.Data.events.get(event.id);
                },
                dayClick: function (date, allDay, jsEvent, view) { // Creation of events on click

                    var end = new Date(date);
                    end.setHours(date.getHours() + 1);
                    var event = new SmartBlocks.Blocks.Calendar.Models.Event();
                    event.setStart(date);
                    event.set("duration", 3600000);
                    event.set("content", "New event");
                    SmartBlocks.Blocks.Calendar.Data.events.add(event);
                    var newEvent = {
                        title: event.get('content'),
                        start: date,
                        id: "noid",
                        allDay: allDay,
                        end: end,
                        className: "event_cal pt_event" + event.get('id'),
                        color: "rgba(50,50,50,0.3)"
                    };
                    base.$el.fullCalendar('renderEvent', newEvent);
                    event.save();
                },
                eventRender: function (event, element) {
                    var elt = $(element);
                    elt.addClass("event_evt_" + event.id);
                    elt.attr("data-id", event.id);
                    elt.dblclick(function (e) {
                        var elt = $(this);
                        var event = SmartBlocks.Blocks.Calendar.Data.events.get(elt.attr('data-id'));
                        $(".event_popup").remove();
                        if (event) {
                            var popup = new PlannedTaskPopup(event);
                            popup.init(base.SmartBlocks, e, event);

                            popup.events.on("deleted", function () {
                                base.$el.fullCalendar('removeEvents', event.id)
                                base.parent.events.trigger("updated_event");
                            });
                            popup.events.on("saved", function (event) {
                                base.$el.fullCalendar('updateEvent', event)
                                base.parent.events.trigger("updated_event");
                            });
                        }
                    });
                },
                viewDisplay: function (view) {

                }
            });
        },
        registerEvents: function () {
            var base = this;
        }
    });

    return View;
});