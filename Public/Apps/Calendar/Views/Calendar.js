define([
    'jquery',
    'underscore',
    'backbone',
    'text!../Templates/calendar.html',
    'ContextMenuView',
    './EventPopup',
    'jqueryui',
    'fullCalendar'
], function ($, _, Backbone, calendar_template, ContextMenu, EventPopup) {
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
                    id: event.get("id"),
                    className: "event_cal pt_event" + event.get('id'),
                    color: "gray",
                    allDay: event.get('all_day') === true
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
                height: base.$el.find('.calendar_container').height(),
                width: base.$el.find('.calendar_container').width(),
                aspectRatio : base.$el.find('.calendar_container').height() / base.$el.find('.calendar_container').width(),
                editable: true,
                droppable: true,
                events: base.events,
                defaultView: "agendaWeek",
                allDaySlot: true,
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

                },
                eventDrop: function (pevent, jsEvent, ui, view) {
                    var event = SmartBlocks.Blocks.Time.Data.events.get(pevent.id);
                    if (event) {
                        event.setStart(pevent.start);
                        event.setEnd(pevent.end);
                        event.set("all_day",pevent.allDay);
                        console.log(event.getStart());

                        event.save();

                    }

                },
                eventResize: function (pevent) {
                    var event = SmartBlocks.Blocks.Time.Data.events.get(pevent.id);

                    if (event) {
                        event.setStart(pevent.start);
                        event.setEnd(pevent.end);


                        event.save({}, {
                            success: function () {

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
                    base.$el.find('.calendar_container').fullCalendar('renderEvent', newEvent, true);
                    event.save({}, {
                        success: function () {
                            console.log(event);
                            console.log(event.getStart(), event.getEnd());
                        }
                    });
                },
                eventRender: function (pevent, element) {
                    var elt = $(element);

                    elt.addClass("event_evt_" + pevent.id);
                    elt.attr("data-id", pevent.id);
                    elt.attr("oncontextmenu", "return false;");
                    elt.mouseup(function (e) {
                        var elt = $(this);
                        var event = SmartBlocks.Blocks.Time.Data.events.get(elt.attr('data-id'));
                        if (e.which == 3) {
                            var context_menu = new ContextMenu();
                            context_menu.addButton("Edit", function () {
                                $(".event_popup").remove();
                                if (event) {
                                    var popup = new EventPopup(event);
                                    popup.init(e, pevent);

                                    popup.events.on("deleted", function () {
                                        base.$el.find('.calendar_container').$el.fullCalendar('removeEvents', pevent.id);
                                    });
                                    popup.events.on("saved", function (event) {
                                        base.$el.find('.calendar_container').fullCalendar('updateEvent', pevent);
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
                                    SmartBlocks.Blocks.Time.Data.events.remove(event);
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

            $(window).resize(function () {
                base.renderCalendar();
            });

            SmartBlocks.Shortcuts.add([
                46
            ], function () {
                console.log("tried", base.selected_pt);
                if (base.$el.height() > 0) {
                    if (base.selected_pt) {
                        var id = base.selected_pt.get('id');
                        base.$el.fullCalendar('removeEvents', [id]);
                        base.selected_pt.destroy({
                            success: function () {

                            }
                        });
                    }
                }
            }, "#calendar");

            SmartBlocks.Blocks.Time.Data.events.on("change", function (model) {
                base.updateEvent(model);
                if (base.selected_pt) {
                    if (base.$el.find(".selected_event").length > 1) {
                        base.$el.find(".selected_event").removeClass("selected_event");
                    }
                    base.$el.find(".pt_event" + model.get('id')).addClass("selected_event");
                }
            });
            SmartBlocks.Blocks.Time.Data.events.on("remove", function (model) {
                base.$el.find('.calendar_container').fullCalendar('removeEvents', [model.get('id')]);
            });

            var move_timer = 0;
            SmartBlocks.Shortcuts.add([
                37
            ], function () {
                if (base.$el.height() > 0) {

                    if (base.selected_pt) {
                        var date = base.selected_pt.getStart();
                        date.setHours(date.getHours() - 24);
                        var end = new Date(base.selected_pt.getEnd());
                        end.setHours(end.getHours() - 24);
                        base.selected_pt.setStart(date);
                        base.selected_pt.setEnd(end);

                        clearTimeout(move_timer);
                        move_timer = setTimeout(function () {
                            base.selected_pt.save();
                        }, 1000);

                    }
                }
            }, "#calendar");

            SmartBlocks.Shortcuts.add([
                39
            ], function () {
                if (base.$el.height() > 0) {
                    if (base.selected_pt) {
                        var date = base.selected_pt.getStart();
                        date.setHours(date.getHours() + 24);

                        var end = new Date(base.selected_pt.getEnd());
                        end.setHours(end.getHours() + 24);
                        base.selected_pt.setStart(date);
                        base.selected_pt.setEnd(end);

                        base.selected_pt.setStart(date);
                        clearTimeout(move_timer);
                        move_timer = setTimeout(function () {
                            base.selected_pt.save();
                        }, 1000);
                    }
                }
            }, "#calendar");

            SmartBlocks.Shortcuts.add([
                38
            ], function () {
                if (base.$el.height() > 0) {
                    if (base.selected_pt) {
                        var date = base.selected_pt.getStart();
                        date.setMinutes(date.getMinutes() - 30);
                        var end = new Date(base.selected_pt.getEnd());
                        end.setMinutes(date.getMinutes() - 30);
                        base.selected_pt.setStart(date);
                        base.selected_pt.setEnd(end);


                        base.selected_pt.setStart(date);
                        clearTimeout(move_timer);
                        move_timer = setTimeout(function () {
                            base.selected_pt.save();
                        }, 1000);
                    }
                }
            }, "#calendar");

            SmartBlocks.Shortcuts.add([
                40
            ], function () {
                if (base.$el.height() > 0) {
                    if (base.selected_pt) {
                        var date = base.selected_pt.getStart();
                        date.setMinutes(date.getMinutes() + 30);

                        var end = new Date(base.selected_pt.getEnd());
                        end.setMinutes(date.getMinutes() + 30);
                        base.selected_pt.setStart(date);
                        base.selected_pt.setEnd(end);

                        base.selected_pt.setStart(date);
                        clearTimeout(move_timer);
                        move_timer = setTimeout(function () {
                            base.selected_pt.save();
                        }, 1000);
                    }
                }
            }, "#calendar");

            //Duration shortcut
            SmartBlocks.Shortcuts.add([
                16, 40
            ], function () {
                if (base.$el.height() > 0) {
                    if (base.selected_pt) {
                        base.selected_pt.set("duration", base.selected_pt.get("duration") + 30 * 60 * 1000);
                        clearTimeout(move_timer);
                        move_timer = setTimeout(function () {
                            base.selected_pt.save();
                        }, 1000);
                    }
                }
            }, "#calendar");

            SmartBlocks.Shortcuts.add([
                16, 38
            ], function () {
                if (base.$el.height() > 0) {
                    if (base.selected_pt) {
                        base.selected_pt.set("duration", base.selected_pt.get("duration") - 30 * 60 * 1000);
                        clearTimeout(move_timer);
                        move_timer = setTimeout(function () {
                            base.selected_pt.save();
                        }, 1000);
                    }
                }
            }, "#calendar");


            base.$el.delegate(".prev_button", "click", function () {
                base.$el.find(".calendar_container").fullCalendar('prev');
                base.update();
            });

            base.$el.delegate(".next_button", "click", function () {
                base.$el.find(".calendar_container").fullCalendar('next');
                base.update();
            });

            base.$el.delegate(".today_button", "click", function () {
                base.$el.find(".calendar_container").fullCalendar('today');
                base.update();
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
                className: "planned_task_cal pt_event" + model.get('id'),
                allDay: model.get('all_day') === true
            };
            base.$el.find('.calendar_container').fullCalendar('renderEvent', newEvent, true);
        }

    });

    return View;
});