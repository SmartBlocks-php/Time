define([
    'jquery',
    'underscore',
    'backbone',
    '../Models/Event'
], function ($, _, Backbone, Event) {
    var Collection = Backbone.Collection.extend({
        model: Event,
        url: "/Time/Events"
    });

    return Collection;
});