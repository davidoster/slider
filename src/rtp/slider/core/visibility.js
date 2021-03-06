/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Visibility Core Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ method: updatePanelExposure @@@
	prototype.updatePanelExposure = function ()
	{

		// get values from the current internal status
		var position = this.slide2panel(this.position),
		    visible = this.conf.panelsVisible || 1;

		// declare local variables
		var conf = this.conf,
		    alignPanel = conf.alignPanel,
		    alignViewport = conf.alignViewport,
		    panelsVisible = conf.panelsVisible;

		// only in non-carousel mode
		if (!conf.carousel)
		{

			// try to show as many panels possible
			if (conf.fillViewport)
			{

				// calculate the left and right space to be filled
				var fill_left = panelsVisible * alignViewport - alignPanel,
				    fill_right = -1 * fill_left + panelsVisible - 1;

				// adjust panel position to make those
				// panels "virtually" visible / exposed
				if (position < this.smin + fill_left)
				{ position = this.smin + fill_left; }
				if (position > this.smax - fill_right)
				{ position = this.smax - fill_right; }

			}
			// EO if conf.fillViewport

			// shrink the viewport on both ends
			else if (conf.shrinkViewport)
			{

				// make sure we only show one slide at the end
				if (position > this.smax + 1 - this.smin - panelsVisible)
				{ panelsVisible = this.smax + 1 - position; }
				// make sure we only show one slide at the start
				else if (position < this.smin - 1 + panelsVisible)
				{ panelsVisible = this.smin + 1 + position; }

			}
			// EO if conf.shrinkViewport

		}
		// EO if not conf.carousel

		// adjust the panel position for the viewport and panel alignment
		position += alignPanel - alignViewport * panelsVisible;

		// declare local variables
		var exposure = [],
		    left = position,
		    i_left = Math.floor(left),
		    right = position + panelsVisible,
		    i_right = Math.ceil(right);

		// initialize exposure array
		var i = this.slides.length;
		while (i--) { exposure[i] = 0; }

		// process panels in visible range
		for (i = i_left; i < i_right; i++)
		{

			// declare local variables
			var out_left = left - i,
			    in_right = right - i,
			    slide = this.slide2slide(i);

			// add visibility
			if (in_right < 1)
			{ exposure[slide] += in_right; }
			else { exposure[slide] += 1; }

			// remove visibility
			if (out_left > 0)
			{ exposure[slide] -= out_left; }

		}

		// store state before calling the changed hock
		// reset the status first, but pass before status
		var s_e = this.s_e; this.s_e = exposure;

		// execute the updatedSlideExposure hook for slides
		this.trigger('updatedSlideExposure', exposure, s_e);


	}
	// @@@ EO method: updatePanelExposure @@@


	// @@@ method: checkSlideVisibility @@@
	prototype.checkSlideVisibility = function ()
	{

		// get values from the current internal status
		var panel = this.ct_off;

		// declare local variables
		var visible,
		    panel_left = 0,
		    visibility = [],
		    widths = this.pd[0],
		    i = this.slides.length,
		    view_left = this.ct_off,
		    view_right = view_left + this.vp_x;

		// initialize visibility array
		while (i--) { visibility[i] = 0; }

		// test how much viewable each panel is right now
		for(i = 0; panel_left < view_right; i ++)
		{

			// normalize from panel to slide
			var slide = this.panel2slide(i);

			// calculate the right panel edge
			var panel_right = panel_left + widths[slide];

			// the panel is out on the left or out on the right
			if (panel_right < view_left || panel_left > view_right)
			{
				visible = 0;
			}
			// the panel is completely inside the viewport
			else if (panel_left >= view_left && panel_right <= view_right)
			{
				visible = 1;
			}
			// the panel does not fit into the viewport completely
			else if (panel_left < view_left && panel_right > view_right)
			{
				visible = (view_right - view_left) / (panel_right - panel_left)
			}
			// the panel is partially on the left
			else if (panel_left < view_left)
			{
				visible = ( panel_right - view_left ) / ( panel_right - panel_left );
			}
			// the panel is partially on the right
			else if (panel_right > view_right)
			{
				visible = ( view_right - panel_left ) / ( panel_right - panel_left );
			}
			// this should not happen
			else
			{
				throw('updateVisibility has invalid state')
			}

			// sum up for slides
			visibility[slide] += visible;

			// move to next panel offset
			panel_left = panel_right;

		}
		// EO each panel

		// store state before calling the changed hock
		// reset the status first, but pass before status
		var s_v = this.s_v; this.s_v = visibility;

		// execute the changedSlideVisibility hook for slides
		this.trigger('changedSlideVisibility', visibility, s_v);

	}
	// @@@ EO method: checkSlideVisibility @@@

	/*
	   The priorities here are important. First we need to call
	   updatePanelExposure to setup viewport dimension (the
	   position has to be set already). Then in the middle we
	   set the container offset, so we then later can call
	   checkSlideVisibility with the updated viewport.
	*/

	// executed when the position is set programmatically (changed internal)
	prototype.plugin('layout', prototype.updatePanelExposure, -99);
	prototype.plugin('layout', prototype.checkSlideVisibility, 99);

	// executed when we have a changed viewport dimension (changed external)
	// prototype.plugin('changedViewportDim', prototype.updatePanelExposure, -99);
	// prototype.plugin('changedViewportDim', prototype.checkSlideVisibility, 99);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
