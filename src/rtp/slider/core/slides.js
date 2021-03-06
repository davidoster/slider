/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Slides Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ method: setSlideDim @@@
	// set the given slide index to given size
	// this method is not available to panels as
	// we have to make sure that cloned panels have
	// exactly the same size as the original panel
	// set the outer dimension of the slide panel
	prototype.setSlideDim = function (slide, outerdim)
	{

		// declare loop variables
		var outer = this.pd[0],
		    inner = this.ps[0],
		    layout = this.pl[0],
		    border = this.pb[0],
		    margin = this.pm[0],
		    padding = this.pp[0];

		// normalize the input variable
		slide = this.slide2slide(slide);

		// get array with all panels for slide
		var panels = this.slidepanels[slide];

		// process original and cloned panels for slide
		var i = panels.length; while (i--)
		{

			// get the index from slidepanels and panel
			var p = panels[i], panel = this.panels[p];

			// get sizing difference (is normalized to content box)
			var boxdiff = margin[p][2] + border[p][2] + padding[p][2];

			// we cannot have a negative outer size
			if (outerdim < boxdiff) outerdim = boxdiff;

			// update dimension and inner size of this panel
			this.pd[0][p] = outerdim;

			this.ps[0][p] = outerdim - boxdiff;

			var dim = this.ps[0][p];

			// if (layout[i] == 'content-box')
			// { dim += padding[i][2]; }
			// else if (layout[i] == 'border-box')
			// { dim += padding[i][2] + border[i][2]; }

			// update panel size
			if (this.conf.vertical)
			{ jQuery(panel).height(dim); }
			else { jQuery(panel).width(dim); }

			// update the panel opposition
			this.pd[1][p] = this.getPanelSize(p, 1);

		}
		// EO each panel

	}
	// @@@ EO method: setSlideDim @@@


	// @@@ method: getPanelsBySlide @@@
	// slidepanel does only store indexes
	// return the actual panel jquery nodes
	prototype.getPanelsBySlide = function (slide)
	{

		// parse into integer
		slide = parseInt(slide, 10);

		// normalize the input variable
		slide = this.slide2slide(slide);

		// get array copy with all panels for slide
		var panels = this.slidepanels[slide].slice();

		// get the actual panel dom nodes
		var i = panels.length; while (i--)
		{ panels[i] = this.panels[panels[i]]; }

		// return collection
		return jQuery(panels);

	}
	// @@@ EO method: getPanelsBySlide @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
