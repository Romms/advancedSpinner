/*
 *  Project: advancedSpinner
 *  Description: Show spinner until all started processes will not be finished
 *  Author: Roman Shevchuk
 *  License: MIT
 */

;(function( $, window, document, undefined ) {
"use strict";

    var pluginName = "advancedSpinner",
        dataKey = "plugin_" + pluginName;

    var Plugin = function ($element, options) {
        this.$element = $element;
        this.options = $.extend({}, $.fn[pluginName].defaults, options);
        this.init();
    };

    Plugin.prototype = {
        init: function () {
            this.$element.data(dataKey, this);
        },

        destroy: function() {
            this.$element.removeData(dataKey);
        }
    };


    $.fn[pluginName] = function(options) {
        var result,
            restArgs = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
            var instance = this.data(dataKey);

            if (instance instanceof Plugin) {
                if (typeof options === "string" && // method name
                        options[0] !== "_" && // protect private methods
                        typeof instance[options] === "function") {

                    // invoke the method with the rest arguments
                    result = instance[options].apply( instance, restArgs );
                    if (result !== undefined) {
                        return false; // break the $.fn.each() iteration
                    }
                }
            } else {
                new Plugin(this, options);
            }
        });

        // if there is no return value,
        // then return 'this' to enable chaining
        return result !== undefined ? result : this;
    };

    $.fn[pluginName].defaults = {
        freezeSize: true,
        debug: false
    };

}( jQuery, window, document ));