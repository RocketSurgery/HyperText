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

	// utility methods
	var isFunction = function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	};

	// Variables private class
	var Variables = function(initial) {
		this.values = {};

		if (typeof initial !== undefined) {
			var key = null;
			for (key in initial) {
				this.values[key] = initial[key];
			}
		}
	};

	Variables.prototype.addValue = function(name, value) {
		this.values[name] = value;
	};

	Variables.prototype.addValues = function(values) {
		var key = null;
		for (key in initial) {
			this.values[key] = initial[key];
		}
	};

	Variables.prototype.setValue = function(name, value) {
		this.values[name] = value;
	};

	Variables.prototype.setValues = function(values) {
		var key = null;
		for (key in initial) {
			this.values[key] = initial[key];
		}
	};

	Variables.prototype.getValue = function(name) {
		return this.values[name];
	};

	// Scene private class
	var Scene = function(id, text) {
		this.id = id;
		this.rawText = text;
	};

	Scene.prototype.getId = function() {
		return this.id;
	};

	Scene.prototype.getRawText = function() {
		return this.rawText;
	};

	Scene.prototype.getParsedText = function(vars) {
		var rawText = this.getRawText();
		// TODO write text parser for Scene
	};

	Scene.prototype.getParsedTextAsHtml = function(vars) {
		var parsedText = this.getParsedText(vars);
		// TODO put parsed text through Markdown converter
	};

	// Hypertext main stuff
	var baseUrl = "";
	var variables = new Variables();
	var start = null;
	var filesList = [];
	var linkHandling = "manual";
	var linkHandler;
	var display;
	var scenes = {};

	HyperText.init = function(config) {

		// get baseUrl
		if (typeof config.baseUrl !== undefined && typeof config.baseUrl === "string") {
			if (config.baseUrl.lastIndexOf("/") == config.baseUrl.length - 1)
				baseUrl = config.baseUrl;
			else
				baseUrl = config.baseUrl + "/";
		}

		// get variables
		if (typeof config.variables !== undefined && typeof config.variables === 'object') {
			variables = new Variables(config.variables);
		}

		// get start
		if (typeof config.start !== undefined && typeof config.start === "string") {
			start = baseUrl + config.start + ".md";
			filesList.push(start);
		} else {
			throw "config must have value 'start', which must be a string with the address of your starting scene.";
		}

		// get files
		if (typeof config.files !== undefined && Object.prototype.toString.call(config.files) === '[object Array]') {

			// iterate over each string, append it to baseUrl, and add it to filesList
			for ( var i = 0, len = config.files.length; i < len; i++) {
				var file = baseUrl + config.files[i] + ".md";
				filesList.push(file);
			}

		} else {
			throw "config must have a value 'files', which must be an array of strings with addresses to your story files.";
		}

		// get linkHandling
		if (typeof config.linkHandling !== undefined) {
			linkHandling = config.linkHandling;
			if (linkHandling !== "manual" && linkHandling !== "auto")
				throw "if config has a value for 'linkHandling', its value must be either 'manual' or 'auto'.";
		}

		// get linkHandler
		if (linkHandling === "manual") {
			if (typeof config.linkHandler !== undefined && isFunction(config.linkHandler)) {
				linkHandler = config.linkHandler;
			} else {
				throw "if 'manual' is chosen for 'linkHandling', a function must be provided for 'linkHandler'.";
			}
		}

		// get display
		if (typeof config.display !== undefined) {
			display = config.display;
		}

		// load start file
		$.ajax({
			url : start,
			success : function(result) {
				console.debug(result);
			},
			async : false
		});

	};

	HyperText.getSceneHtml = function(id) {
		if (typeof scenes[id] !== undefined) {
			return scenes[id];
		} else {
			throw "Scene " + id + " does not exist or has not been loaded";
		}
	};

	// ///////////////////////////////////////////////
	// copied from jQuery to be AMD compliant
	// ///////////////////////////////////////////////
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = HyperText;
	}
	if (typeof define === "function" && define.amd) {
		define("hypertext", [], function() {
			return HyperText;
		});
	}

	// If there is a window object, that at least has a document property,
	// define jQuery and $ identifiers
	if (typeof window === "object" && typeof window.document === "object") {
		window.HyperText = HyperText;
	}

})(window);
