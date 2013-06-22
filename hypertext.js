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

	var createDomFromString = function(string) {
		var div = document.createElement("div");
		$(div).html(string);
		$(div).html($(div).html());

		console.debug($(div).html());

		return $(div);
	};

	// Variables private class
	var Variables = (function(initial) {
		this.values = {};

		if (typeof initial !== undefined) {
			var key = null;
			for (key in initial) {
				this.values[key] = initial[key];
			}
		}

		return this;
	});

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
	var Scene = (function(id, raw) {
		this.id = id;
		this.rawText = raw;
	});

	Scene.prototype.getId = function() {
		return this.id;
	};

	Scene.prototype.getRawText = function() {
		return this.rawText;
	};

	var parseText = function(rawText, vars) {

		var parsedText = new String(rawText);

		// find each macro and remove until no macros remain
		while (true) {

			var i = parsedText.indexOf("<<");

			// if no remaining macros, break
			if (i === -1)
				break;

			// denotes starting index of macro
			var startIndex = i;

			// denotes index of first close bracket of macro
			// macro includes all characters from startIndex through endIndex + 1
			var endIndex = i = parsedText.indexOf(">>", i);

			// validity testing for macros
			if (endIndex === -1) {
				throw "all macros must have open and close bracket";
			} else if (endIndex < startIndex + 5) {
				throw "all macros must have a command and content";
			}

			// parse command
			var macro = parsedText.substring(startIndex + 2, endIndex);

			console.debug(macro);

			var macroArray = macro.split(" ");
			var command = macroArray[0];

			console.debug(command);

			var replaceString = "";

			if (command === "print") {
				if (macroArray.length > 2)
					throw "print macros may only have one argument";

				var arg = macroArray[1];

				if (arg.charAt(0) === "$") {
					// retrieve as variable value
					replaceString = vars.getValue(arg.substring(1));

				} else {
					// its a scene
					replaceString = getSceneParsedText(arg);

				}

			} else if (command === "link") {
				console.debug("link found to " + macroArray[1])
				if (linkHandling === "automatic") {
					replaceString = '<a href="' + macroArray[1] + '" class="handled">' + macroArray[1] + '</a>';
				} else {
					// TODO write macro parsing for manual links
				}
			} else if (command === "back") {
				if (linkHandling === "automatic") {
					replaceString = '<a href="back" class="handled" id="back">back</a>';
				} else {
					// TODO write macro parsing for manual back
				}
			} else {
				eval(macro);
			}

			// the macros MUST be removed otherwise the loop will never exit
			parsedText = parsedText.substring(0, startIndex) + replaceString + parsedText.substring(endIndex + 2);
		}

		console.debug(parsedText);

		return parsedText;
	};

	Scene.prototype.getParsedText = function(vars) {
		return parseText(this.getRawText(), vars);
	};

	Scene.prototype.getParsedTextAsHtml = function(vars) {
		var parsedText = this.getParsedText(vars);
		var html = converter.makeHtml(parsedText);

		return html;
	};

	// History private class
	var History = (function() {
		this.stack = [];
		this.current = null;
		return this;
	});

	History.prototype.pushScene = function(sceneId) {
		if (this.current === null) {
			this.current = sceneId;
		} else {
			this.stack.push(this.current);
			this.current = sceneId;
		}
	};

	History.prototype.popScene = function() {
		if (this.current === null) {
			throw "cannot pop from an empty history";
		} else if (this.stack.length === 0) {
			this.current = null;
		} else {
			this.current = this.stack.pop();
		}
		return this.current;
	};

	History.prototype.clearHistory = function() {
		this.stack = [];
	};

	// HyperText main stuff
	var converter = null;

	var baseUrl = "";
	var variables = new Variables();
	var start = null;
	var startScene = null;
	var fileList = [];
	var linkHandling = "manual";
	var linkHandler = null;
	var display = null;
	var scenes = {};
	var history = null;

	var parseScenesFromFile = function(file) {

		file = new String(file);

		var index = file.indexOf("<<scene");
		while (index != -1) {

			// get indices
			var properIndex = index + 8;
			var closeIndex = file.indexOf(">>", properIndex);

			// get id
			var id = file.substring(properIndex, closeIndex);
			index = file.indexOf("<<scene", properIndex);

			// get scene text
			var sceneText;
			if (index == -1)
				sceneText = file.substring(closeIndex + 2);
			else
				sceneText = file.substring(closeIndex + 2, index);

			// add scene to scenes
			scenes[id] = new Scene(id, sceneText);
		}
	};

	var loadFileAndParseScenesSync = function(URL) {
		$.ajax({
			url : URL,
			success : function(result) {
				parseScenesFromFile(result);
			},
			async : false
		});
	};

	var loadFileAndParseScenes = function(URL) {
		$.ajax({
			url : URL,
			success : function(result) {
				parseScenesFromFile(result);
			},
			async : true
		});
	};

	var init = HyperText.init = function(config) {

		// I - read values from config
		// I.a - get baseUrl
		if (typeof config.baseUrl !== undefined && typeof config.baseUrl === "string") {
			if (config.baseUrl.lastIndexOf("/") == config.baseUrl.length - 1)
				baseUrl = config.baseUrl;
			else
				baseUrl = config.baseUrl + "/";
		}

		// I.b - get variables object
		if (typeof config.variables !== undefined && typeof config.variables === 'object') {
			variables = new Variables(config.variables);
		}

		// I.c - get start scene
		if (typeof config.start !== undefined && typeof config.start === "string") {
			start = baseUrl + config.start + ".md";
			fileList.push(start);
		} else {
			throw "config must have value 'start', which must be a string with the address of your starting scene.";
		}

		// I.d - get story files
		if (typeof config.files !== undefined && Object.prototype.toString.call(config.files) === '[object Array]') {

			// iterate over each string, append it to baseUrl, and add it to filesList
			for ( var i = 0, len = config.files.length; i < len; i++) {
				var file = baseUrl + config.files[i] + ".md";
				fileList.push(file);
			}

		} else {
			throw "config must have a value 'files', which must be an array of strings with addresses to your story files.";
		}

		// I.e - get linkHandling
		if (typeof config.linkHandling !== undefined) {
			linkHandling = config.linkHandling;
			if (linkHandling !== "manual" && linkHandling !== "automatic")
				throw "if config has a value for 'linkHandling', its value must be either 'manual' or 'automatic'.";
		}

		// I.f - get linkHandler
		if (linkHandling === "manual") {
			if (typeof config.linkHandler !== undefined && isFunction(config.linkHandler)) {
				linkHandler = config.linkHandler;
			} else {
				throw "if 'manual' is chosen for 'linkHandling', a function must be provided for 'linkHandler'.";
			}
		}

		// I.g - get display frame
		if (typeof config.display !== undefined) {
			display = $(config.display);
		} else {
			throw "a DOM object to be used for text output must be given.";
		}

		// II - initialize variables
		history = new History();
		converter = new Showdown.converter();

		// III - perform final setup
		// III.a - load start file
		loadFileAndParseScenesSync(start);

		// III.b - load remaining files
		for ( var i = 0, len = fileList.length; i < len; i++)
			loadFileAndParseScenes(fileList[i]);

		// III.c - display start screen
		if (linkHandling == "automatic") {
			if (hasScene("start")) {
				displayScene("start");
			} else {
				throw "starting file must contain a scene with id 'start'.";
			}
		}

	};

	var hasScene = HyperText.hasScene = function(id) {
		return (typeof scenes[id] !== undefined);
	};

	var getScene = HyperText.getScene = function(id) {
		if (hasScene(id)) {
			return scenes[id];
		} else {
			throw "Scene " + id + " does not exist or has not been loaded";
		}
	};

	var getSceneRawText = HyperText.getSceneRawText = function(id) {
		return getScene(id).getRawText();
	};

	var getSceneParsedText = HyperText.getSceneParsedText = function(id) {
		return getScene(id).getParsedText();
	};

	var getSceneHtml = HyperText.getSceneHtml = function(id) {
		return getScene(id).getParsedTextAsHtml(variables);
	};

	var displayScene = function(sceneId) {
		// I - display linked scene
		// I.a - clear display frame
		display.html("");

		// I.b - display next scene
		display.html(getSceneHtml(sceneId));

		// II - background handling
		// II.a - push new scene to history
		history.pushScene(sceneId);

		// II.b - add link handler to new scene links
		$("a").click(function(e) {
			linkHandler(e);
			e.stopPropagation();
			e.preventDefault();
		});
		console.debug("link handler set");
	};

	var linkHandler = function(e) {
		if ($(e.target).attr("id") === "back") {
			displayScene(history.popScene());
		} else {
			var targetScene = $(e.target).attr("href");
			displayScene(targetScene);
		}
	};

	var back = HyperText.back = function() {
		var scene = history.popScene();
		linkHandler(scene);
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
