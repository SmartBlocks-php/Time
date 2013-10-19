define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var Model = Backbone.Model.extend({
        default: {
            data : [],
            stuff: "sdfsdf"
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
        }
    });
    return Model;
});