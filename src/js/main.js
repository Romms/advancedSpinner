/*
 *  Project: advancedSpinner
 *  Description: Show spinner until all started processes will not be finished
 *  Author: Roman Shevchuk
 *  License: MIT
 */

;(function( $, window, document, undefined ) {
    "use strict";

    const pluginName = "advancedSpinner",
        dataKey = "plugin_" + pluginName;

    const Process = function () {
        this.count = 0;
        this.message = undefined;
    };

    const Plugin = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn[pluginName].defaults, options);
        this._init();
    };

    Plugin.prototype = {
        _init: function () {
            this.processes = {};
            if (typeof this.$container === 'undefined') {
                this.$container = $(
                    '<div class="advancedSpinner">' +
                        '<div class="advancedSpinner-wrapper">' +
                            '<div class="advancedSpinner-spinner"></div>' +
                            '<ul class="advancedSpinner-messages"></ul>' +
                        '</div>' +
                    '</div>'
                );
                if (this.options.spinner instanceof $) {
                    this.$container.find('.advancedSpinner-spinner').append(this.options.spinner);
                }
                this.$element.append(this.$container);
            }
            this._debug('Initialization done');
        },

        isRunning: function (processName) {
            return typeof this.processes[processName] !== "undefined";
        },

        isAnyProcessRunning: function () {
           return !$.isEmptyObject(this.processes);
        },

        getProcesses: function () {
            return $.extend({}, this.processes);
        },

        start: function (processName, message) {
            if (!this.isRunning(processName)) {
                this.processes[processName] = new Process();
            }

            this.processes[processName].count++;
            if (message) {
                this.processes[processName].message = message;
            }

            // TODO: check access by link!!
            // TODO: this._trigger('started', processName, Object.assign({}, this.processes[processName]));
            this._trigger('started', [processName, this.processes[processName]]);
            this._refreshView();
        },

        // TODO: give better name for "force"
        finish: function (processName, force) {
            force = force || false;
            if (this.isRunning(processName)) {

                do {
                    this.processes[processName].count--;
                    this._trigger('finished', [processName, this.processes[processName]]);
                } while (force && this.processes[processName].count > 0);

                if (this.processes[processName].count <= 0) {
                    delete this.processes[processName];
                }

                if (!this.isAnyProcessRunning()) {
                    this._trigger('finishedAll');
                }

                this._refreshView();
            }
        },

        finishAll: function () {
            var hasStarted = false;
            $.each(this.processes, function (processName) {
                hasStarted = true;
                this.finish(processName, true);
            });

            if (hasStarted) {
                this._trigger('finishedAll');
            }
        },

        destroy: function() {
            // TODO: move work with data from plugin's method
            this.$element.removeData(dataKey);
            this.$container.remove();
            delete this.$container;
            this._debug('Spinner has been destroyed');
        },

        _refreshView: function () {
            if (this.isAnyProcessRunning()) {
                this._show();
            } else {
                this._hide();
            }
        },

        _show: function () {
            var $messages = this.$container.find('.advancedSpinner-messages');
            $messages.empty();

            $.each(this.processes, function (processName, process) {
                if (process.message) {
                    var $li = $('<li />');
                    $li.text(process.message);
                    $messages.append($li);
                }
            });

            this.$container.addClass('advancedSpinner-showed');
            this.$container.removeClass('advancedSpinner-hidden');
            this._debug('Spinner has been showed');
        },

        _hide: function () {
            this.$container.removeClass('advancedSpinner-showed');
            this.$container.addClass('advancedSpinner-hidden');
            this._debug('Spinner has been hidden');
        },

        _trigger: function(type, data) {
            this.$element.trigger(this.options.eventPrefix + type, data);
            this._debug('Event "%s" is triggered.', type, 'Data: ', data);
        },

        _debug: function() {
            if (this.options.debug) {
                var args = Array.prototype.slice.call(arguments);
                if (typeof arguments[0] === 'string') {
                    args[0] = '[' + pluginName + ']: ' + arguments[0];
                } else {
                    args.unshift('[' + pluginName + ']:');
                }
                console.log.apply(console, args);
            }
        }
    };


    $.fn[pluginName] = function(options) {
        var result,
            restArgs = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
            var instance = $(this).data(dataKey);

            if (instance instanceof Plugin === false) {
                instance = new Plugin(this, options);
                $(this).data(dataKey, instance);
            }

            if (typeof options === "string" && // method name
                options[0] !== "_" && // protect private methods
                typeof instance[options] === "function") {

                // invoke the method with the rest arguments
                result = instance[options].apply( instance, restArgs );
                if (result !== undefined) {
                    return false; // break the $.fn.each() iteration
                }
            }
        });

        // if there is no return value,
        // then return 'this' to enable chaining
        return result !== undefined ? result : this;
    };

    $.fn[pluginName].defaults = {
        freezeSize: true,
        debug: false,
        spinner: $('<div class="advancedSpinner-spinner-default"/>'),
        eventPrefix: ''
    };

}( jQuery, window, document ));