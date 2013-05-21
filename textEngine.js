// create showdown extension
(function() {
	var stuff = function(converter) {
		return [ {
			// variables
			// {-stuff-} -> <var>stuff</var>
			type : 'lang',
			regex : '(<<(.*)>>)',
			replace : function(match, prefix, content, suffix) {
				return '<span class="var">' + content + '</span>';
			}
		}, {
			// scene head
			// <p>{{(stuff)</p> -> <scene id="stuff">
			type : 'output',
			regex : '(<p>\\{\\{\\((.*)\\)<\\/p>)',
			replace : function(match, prefix, value) {
				return '<scene id="' + value + '">';
			}
		}, {
			// scene head
			// <p>}}</p> -> </scene>
			type : 'output',
			regex : '(<p>}}<\\/p>)',
			replace : function(match) {
				return '</scene>';
			}
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
(function() {

	// Establish the root object, window in the browser, or global on the server.
	var root = this;

	// saves previous version of TextEngine for noConflict mode
	var _TextEngine = root.TextEngine;

	// The top-level namespace. All public TextEngine classes and modules will
	// be attached to this.
	var TextEngine = (function() {
		return {};
	});

	TextEngine.test = function() {
		console.debug("test");
	};

	// Runs TextEngine.js in *noConflict* mode, returning the TextEngine variable
	// to its previous owner. Returns a reference to this TextEngine object.
	TextEngine.noConflict = function() {
		root.TextEngine = _TextEngine;
		return this;
	};

	// ////////////////////////////
	// main TextEngine code
	// ////////////////////////////

	// private variables
	var converter = TextEngine.converter = new Showdown.converter({
		extensions : [ 'stuff' ]
	});
	var scenes = TextEngine.scenes = {};
	var variables = null;
	var configured = false;

	TextEngine.config = function(conf) {

		// get variables container
		if (!conf.variables)
			throw "config must include a value for 'variables'";
		variables = this.variables = conf.variables;

		// if baseUrl is set
		var baseUrl = this.baseUrl = "";
		if (conf.baseUrl) {
			baseUrl = this.baseUrl += conf.baseUrl + "/";
		}

		// go through the list of files and load the scenes in each one
		if (!conf.files)
			throw "config must include a value for 'files'";
		var sourcesList = this.sourcesList = conf.files;
		for ( var i = 0, len = sourcesList.length; i < len; i++) {
			var URL = baseUrl + sourcesList[i] + ".md";
			console.log(i + " : " + URL);
			$.ajax({
				url : URL,
				success : function(data) {

					// run data through showdown to convert to markup
					data = new String(data);
					data = converter.makeHtml(data);

					// add wrapper tag to make legal XML
					data = "<story>" + data + "</story>";

					console.debug(data);

					// iterate over each scene tag and store html in scenes
					var xml = $.parseXML(data);
					console.debug(xml);

					$(xml).find("scene").each(function() {
						var id = $(this).attr("id");
						console.debug(id);
						console.debug(this);
						scenes[id] = this;
					});
				},
				async : false

			});
		}

		configured = true;
	};

	TextEngine.scene = function(sceneID) {
		
		if (!configured)
			throw "TextEngine.config() must be the first function called";

		var scene = scenes[sceneID];
		console.debug(scene);

		if (scene === undefined)
			throw "call to scene " + sceneID + " must provide the ID of an existing scene";

		// evaluate variables
		$(scene).find("span").text(function(index, text) {
			console.debug(this);
			var returnVal = variables[text];
			console.debug(returnVal);
			return returnVal;
		});

		// trick javascript into recognizing html
		var div = document.createElement("div");
		$(div).append($(scene).contents());
		console.debug(div);
		$(div).html($(div).html());
		
		return $(div).html();
	};

	// establish global TextEngine variable
	root.TextEngine = TextEngine;
	return TextEngine;

}).call(this);
