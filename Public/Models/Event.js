define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var Model = Backbone.Model.extend({
        default: {
            all_day: false
        },
        urlRoot: "/Time/Events",
        getStart: function () {
            var base = this;
            return new Date(base.get("start"));
        },
        setStart: function (date) {
            var base = this;
            base.set("start", date.toISOString());
        },
        getEnd: function () {
            var base = this;
            return new Date(base.get("end"));
        },
        setEnd: function (date) {
            var base = this;
            base.set("end", date.toISOString());
        },
        getDuration: function (start, end) {
            var base = this;
            var calc_start = start > base.getStart() ? start : base.getStart();
            var calc_end = end < base.getEnd() ? end : base.getEnd();
            var duration = calc_end.getTime() - calc_start.getTime();
            if (duration > 0) {
                return duration;
            } else {
                return 0;
            }
        },
        getDoneDuration: function (start, end) {
            var base = this;
            var now = new Date();
            if (now < end) {
                end = now;
            }
            var base = this;
            var calc_start = start > base.getStart() ? start : base.getStart();
            var calc_end = end < base.getEnd() ? end : base.getEnd();
            var duration = calc_end.getTime() - calc_start.getTime();
            if (duration > 0) {
                return duration;
            } else {
                return 0;
            }

        },
        getLeftDuration: function (start, end) {
            var base = this;
            var now = new Date();
            if (now > start) {
                start = now;
            }
            var base = this;
            var calc_start = start > base.getStart() ? start : base.getStart();
            var calc_end = end < base.getEnd() ? end : base.getEnd();
            var duration = calc_end.getTime() - calc_start.getTime();
            if (duration > 0) {
                return duration;
            } else {
                return 0;
            }
        }
    });
    return Model;
});