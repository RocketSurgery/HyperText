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

		return this;
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
	var Scene = function(id, raw) {
		this.id = id;
		this.rawText = raw;
	};

	Scene.prototype.getId = function() {
		return this.id;
	};

	Scene.prototype.getRawText = function() {
		return this.rawText;
	};

	Scene.prototype.getParsedText = function(vars) {
		var parsedText = new String(this.getRawText());

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

			} else {
				eval(macro);
			}

			// the macros MUST be removed otherwise the loop will never exit
			parsedText = parsedText.substring(0, startIndex) + replaceString + parsedText.substring(endIndex + 2);
		}

		return parsedText;
	};

	Scene.prototype.getParsedTextAsHtml = function(vars) {
		var parsedText = this.getParsedText(vars);
		return converter.makeHtml(parsedText);
	};

	// HyperText main stuff
	var converter = new Showdown.converter();

	var baseUrl = "";
	var variables = new Variables();
	var start = null;
	var startScene;
	var fileList = [];
	var linkHandling = "manual";
	var linkHandler;
	var display;
	var scenes = {};

	var parseScenesFromFile = HyperText.parseScenesFromFile = function(file) {

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

	var loadFileAndParseScenesSync = HyperText.loadFileAndParseScenesSync = function(URL) {
		$.ajax({
			url : URL,
			success : function(result) {
				parseScenesFromFile(result);
			},
			async : false
		});
	};

	var loadFileAndParseScenes = HyperText.loadFileAndParseScenes = function(URL) {
		$.ajax({
			url : URL,
			success : function(result) {
				parseScenesFromFile(result);
			},
			async : true
		});
	};

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
			fileList.push(start);
		} else {
			throw "config must have value 'start', which must be a string with the address of your starting scene.";
		}

		// get files
		if (typeof config.files !== undefined && Object.prototype.toString.call(config.files) === '[object Array]') {

			// iterate over each string, append it to baseUrl, and add it to filesList
			for ( var i = 0, len = config.files.length; i < len; i++) {
				var file = baseUrl + config.files[i] + ".md";
				fileList.push(file);
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
		loadFileAndParseScenesSync(start);

		// load remaining files
		for ( var i = 0, len = fileList.length; i < len; i++)
			loadFileAndParseScenes(fileList[i]);

		// display start screen
		if (linkHandling == "auto") {
			if (hasScene("start"))
				$(display).html(getSceneHtml("start"));
			else
				throw "starting file must contain a scene with id 'start'.";
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
