// create showdown extension
(function() {
	var stuff = function(converter) {
		return [ {
			// variables
			// <<stuff>> -> <var>stuff</var>
			type : 'lang',
			regex : '(<<(.*)>>)',
			replace : function(match, prefix, content, suffix) {
				return '<span class="var">' + content + '</span>';
			}
		}, {
			// scene open
			// <p>{{(stuff)</p> -> <scene id="stuff">
			type : 'output',
			regex : '(<p>\\{\\{\\((.*)\\)<\\/p>)',
			replace : function(match, prefix, value) {
				return '<scene id="' + value + '">';
			}
		}, {
			// scene close
			// <p>}}</p> -> </scene>
			type : 'output',
			regex : '(<p>}}<\\/p>)',
			replace : function(match) {
				return '</scene>';
			}
		}, {
			// scene links
			// [[text]](sceneName) -> <a href="sceneName" class="scene">text</a>
			type : 'lang',
			regex : '(\\[\\[(.*)\\]\\]\\((.*)\\))',
			replace : function(match, otherMatch, text, sceneName) {
				return '<a href="' + sceneName + '" class="scene">' + text + '</a>';
			}
		}, {
			// fix <br> tags to make xml complient
			// <br> -> <br />
			type : 'output',
			regex : '<br>',
			replace : '<br />'
		} ];
	};

	// Client-side export
	if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
		window.Showdown.extensions.stuff = stuff;
	}
	// Server-side export
	if (typeof module !== 'undefined')
		module.exports = stuff;
}());
(function(window, undefined) {

	// Establish the root object, window in the browser, or global on the server.
	var root = window;

	// saves previous version of HyperText for noConflict mode
	var _HyperText = root.HyperText;

	// The top-level namespace. All public HyperText classes and modules will
	// be attached to this.
	var HyperText = (function() {
		return {};
	});

	// Runs HyperText.js in *noConflict* mode, returning the HyperText variable
	// to its previous owner. Returns a reference to this HyperText object.
	HyperText.noConflict = function() {
		root.HyperText = _HyperText;
		return this;
	};

	// ////////////////////////////
	// main HyperText code
	// ////////////////////////////

	
	// stuff copied from jQuery to be AMD complient
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = HyperText;
	} else {
		if (typeof define === "function" && define.amd) {
			define("hypertext", [], function() {
				return HyperText;
			});
		}
	}

	// If there is a window object, that at least has a document property,
	// define jQuery and $ identifiers
	if (typeof window === "object" && typeof window.document === "object") {
		window.HyperText = HyperText;
	}

})(window);
