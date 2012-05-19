_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

var jskom = {
    version: "0.1",
    
    // httpkom server URL without trailing slash (example: 'http://localhost:5001')
    httpkom: "",
    
    Models: {},
    Collections: {},
    Views: {},
    
    init: function() {
        $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
            options.url = jskom.httpkom + options.url;

            options.xhrFields = {
                withCredentials: true
            };
            // If we have a csrf token send it through with the next request
            //if(typeof that.get('_csrf') !== 'undefined') {
            //    jqXHR.setRequestHeader('X-CSRF-Token', that.get('_csrf'));
            //}
        });
        
        //jskom.vent = _.extend({}, Backbone.Events); // event aggregator
        
        // debug
        //jskom.vent.on('all', function(eventName) {
        //    console.log("vent: " + eventName);
        //});
        
        var jskomUrlRoot = '/';
        jskom.Models.Session.fetchCurrentSession(function(currentSession) {
            jskom.router = new jskom.Router({
                currentSession: currentSession,
                urlRoot: jskomUrlRoot
            });
            Backbone.history.start({ pushState: true, root: jskomUrlRoot });
        });
    }
};

$(function() {
    jskom.init();
});
