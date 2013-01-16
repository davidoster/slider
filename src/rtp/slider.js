/*global RTP, jQuery*/
/*

  Copyright (c) Marcel Greter 2010/2012 - rtp.ch - RTP jQuery Slider
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// START anonymous scope
(function($) {
    'use strict';

    // declare our namespace
    if (!window.RTP) window.RTP = {};

    RTP.Slider = function (el, conf)
    {
        // create closure for
        // resize event handler
        var slider = this;

        // defer until all images are loaded
        // otherwise we will not get valid info
        // about resource dimensions like images
        $('IMG', el).imagesLoaded(function () {


            $(el).addClass('rtp-slider-initialized');

            // only init once
            if (slider.inited) { return; }
            else { slider.inited = true; }

            // mix defaults with given settings
            slider.conf = $.extend({

                // the panel alignment to the position
                align: 'center',
                // inherit from align
                alignPanel: false,
                alignViewport: false,

                // vertical sliding is also supported
                vertical: false,

                // set float parameter for panels
                // will not be set if vertical is true
                setFloat: true,

                // enable endless carousel
                carousel: false,

                // the first slide to load after init
                // this can also be a callback function
                slideFirst: 0,

                // how many panels should be visible
                // mainly used for the layout sizers, but
                // also defines how many panels are cloned
                panelsVisible: 1,

                // initialize some structures
                // they can be used by plugins
                text: {}, // localized texts
                tmpl: {} // templates fragments

            }, conf);

            // classes to mark panels
            slider.klass = {
                next: 'next',
                current: 'current',
                previous: 'previous'
            };

            // templating bits might be overridden
            slider.tmpl = {
                'wrapper' : '<div class="rtp-slider-wrapper"></div>',
                'container' : '<div class="rtp-slider-container"></div>'
            };

            // selectors for dom elements
            slider.selector = {
                panel : 'DIV.rtp-slider-panel',
                container : 'DIV.rtp-slider-container'
            };


            // execute all init hooks
            slider.trigger('config');

            if (isNaN(slider.conf.align)) { slider.conf.align = 0.5; }
            if (isNaN(slider.conf.panelsVisible)) { slider.conf.panelsVisible = 0.5; }

            // current element is used as our viewport
            var viewport = slider.viewport = $(el);

            // get all intial panels (slides) once at startup (after config)
            var slides = slider.slides = viewport.find(slider.selector.panel);

            // put a wrapper around everything
            var wrapper = slider.wrapper = viewport
                .wrapAll(slider.tmpl.wrapper).parent();

            // wrap all panels into container
            var container = slider.container = viewport
                .wrapInner(slider.tmpl.container)
                .find(slider.selector.container);

            // min index for slides and panels
            slider.rmin = slider.smin = slider.pmin = 0;

            if (slider.conf.vertical) {
                slider.wrapper.addClass('rtp-slider-vertical');
            }

            // first slide to load may be a function
            slider.position = $.isFunction(slider.conf.slideFirst) ?
                slider.conf.slideFirst.call(slider) : slider.conf.slideFirst || 0;

            // init array always
            // avoid checks in code
            slider.cloned = $();

            if (slider.conf.carousel) {

                // Clone as many panels needed to fill the viewport.
                // If sizer is false you can use this config option
                // to adjust how many panels you want to have cloned
                // In this mode the viewport might be much wider than
                // all panels inside. Todo: Maybe support this better.
                var panelsToClone = slider.conf.clonePanels ||
                    Math.ceil(slider.conf.panelsVisible);

                // accumulate all cloned panels
                // we may clone each slide more than once
                var cloned = $();

                // I will clone as many as you wish
                while (panelsToClone > slides.length) {
                    // remove a full set of slides
                    panelsToClone -= slides.length;
                    // clone and add another full set
                    cloned = cloned.add(slides.clone());
                }

                // clone panels from begining to extend the container
                cloned = cloned.add(slides.slice(0, panelsToClone).clone());

                // append the cloned panels to the container and set class
                cloned.appendTo(slider.container).addClass('cloned');

                // increase maximum slide index
                slider.smax += cloned.length;

                // store the cloned panels
                slider.cloned = cloned;

            }

            // this can be a number between -INF and +INF
            // or you can use "left", "center" or "right"
            function resolve_align (key, preset) {

                // get configured option
                var align = this.conf[key];

                // check if align matches any of our strings
                if (new RegExp(/^l/i).test(align)) { align = 0.0; }
                if (new RegExp(/^c/i).test(align)) { align = 0.5; }
                if (new RegExp(/^r/i).test(align)) { align = 1.0; }

                // now check if it's valid or use given preset
                if (isNaN(parseInt(align, 10))) { align = preset; }
                // maybe there was no preset given, check again
                if (isNaN(parseInt(align, 10))) { align = 0.5; }

                // assign and return the number
                return this.conf[key] = align;
            }

            // first resolve the shared value to inherit from
            var preset = resolve_align.call(slider, 'align', 0.5);
            // then resolve the specific align options
            resolve_align.call(slider, 'alignViewport', preset);
            resolve_align.call(slider, 'alignPanel', preset);


            // execute all init hooks
            slider.trigger('init');


            // lookup panels - equals slides if carousel == false
            slider.panels = viewport.find(slider.selector.panel);

            // to which side should we float the panels / container
            var floating = slider.conf.offsetReverse ? 'right' : 'left';

            if (slider.conf.vertical) { floating = 'none'; }

            var overflow = slider.conf.carousel3d ? 'visible' : 'hidden';

            // set some css to fix some issues
            // if you do not want this you have
            // to remove these styles on ready event
            slider.panels
                .css({
                    'float' : floating
                })
                .add(slider.viewport)
                .add(slider.container)
                .css({
                    'zoom' : 1,
                    'overflow' : overflow,
                    'position' : 'relative'
                });

            if (slider.conf.vertical) {
                slider.viewport.css({
                    'min-height': '50px'
                });
                slider.container.css({
                    'top': '0px',
                    'left': '0px',
                    'right': '0px',
                    'bottom': '0px',
                    'position': 'absolute'
                });
            }


            // setup floats for the container
            if (!slider.conf.vertical) {
                // we either float the container right or left
                slider.container.css('float', floating)
                    // insert a float clearing div after the container
                    .after('<DIV style="clear:both;"/>');
            }

            slider.trigger('ready');
        });

    };


    (function (prototype) {

        prototype.panel2panel = function(panel) {
            // adjust for carousel
            if (this.conf.carousel) {
                // adjust panels into the valid range
                while (panel > this.smax) { panel -= this.slides.length; }
                while (panel < this.smin) { panel += this.slides.length; }
            } else {
                // adjust panels to outer ranges
                if (panel > this.smax) { panel = this.smax; }
                if (panel < this.smin) { panel = this.smin; }
            }
            // return the in range panel
            return panel;
        };


        prototype.slide2panel = function (slide) {
            return this.panel2panel(slide + this.smin);
        };

        prototype.panel2slide = function (panel) {
            return this.panel2panel(panel) - this.smin;
        };

        prototype.slide2slide = function (slide) {
            return this.panel2slide(this.slide2panel(slide));
        };


    // EO extend class prototype
    })(RTP.Slider.prototype, $);


    /* @@@@@@@@@@ JQUERY CONNECTOR @@@@@@@@@@ */
    $.fn.rtpSlider = function (conf) {
        return this.each(function () {
            // check if already initialized
            if (typeof $(this).data('rtp-slider') === 'undefined')
            { $(this).data('rtp-slider', new RTP.Slider(this, conf)); }
        });
    };


// END anonymous scope
})(jQuery);

