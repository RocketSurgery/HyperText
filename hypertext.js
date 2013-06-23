(function(window, undefined) {

	// Establish the root object, window in the browser, or global on the server.
	var root = window;

	// saves previous version of HyperText for noConflict mode
	var _HyperText = root.HyperText;

	// The top-level namespace. All public HyperText classes and modules will
	// be attached to this.
	var HyperText = function() {
	};

	// Runs HyperText.js in *noConflict* mode, returning the HyperText variable
	// to its previous owner. Returns a reference to this HyperText object.
	HyperText.noConflict = function() {
		root.HyperText = _HyperText;
		return this;
	};

	// PRIVATE VARIABLES
	var converter = null;

	var baseUrl = "";
	var variables = null;
	var start = null;
	var fileList = [];
	var linkHandling = "manual";
	var linkHandler = null;
	var display = null;
	var scenes = {};
	var history = null;
	var linkSet = null;

	// PUBLIC VARIABLES
	HyperText.BACK = "com.github.rocketsurgery.hypertext.BACK";

	// UTILITY PRIVATE METHODS
	var isFunction = function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	};

	var findNextMacro = function(rawText, startIndex) {
		var i = rawText.indexOf("<<", startIndex);

		// if no remaining macros, return null
		if (i === -1)
			return null;

		// denotes starting index of macro
		var startIndex = i;

		// denotes index of first close bracket of macro
		// macro includes all characters from startIndex through endIndex + 1
		var endIndex = i = rawText.indexOf(">>", i);

		// validity testing for macros
		if (endIndex === -1) {
			throw {
				name : "illegal argument exception",
				message : "macro not closed properly"
			};
		} else if (endIndex < startIndex + 5) {
			throw {
				name : "illegal argument exception",
				message : "macro must have a command"
			};
		}

		// parse macro text
		var content = rawText.substring(startIndex + 2, endIndex);

		var macroArray = content.split(" ");
		var command = macroArray[0];
		content = content.substring(command.length + 1);

		return {
			command : command,
			content : content,
			startIndex : startIndex,
			endIndex : endIndex + 2
		};
	};

	var evalConditionalString = function(condText, vars) {
		var condArray = condText.split(" ");
		for ( var i = 0; i < condArray.length; i++) {
			if (condArray[i].charAt(0) === "$") {
				condArray[i] = "vars.getValue('" + condArray[i].substring(1) + "')";
			}
		}
		condText = condArray.join(" ");
		console.debug("condText: " + condText);
		return eval(condText);
	};

	var parseConditional = function(condText, vars) {

		var current = findNextMacro(condText, 0);

		// find appropriate for block
		while (true) {

			// find closing macro
			var end = findNextMacro(condText, current.endIndex);
			while (true) {
				if (end.command === "elseif" || end.command === "else" || end.command === "endif") {
					break;
				} else if (end.command === "if") {

					// parse out of nested if blocks
					// after loop, end will be set to the endif corresponding to the previous if macro
					var ifDepth = 0;
					end = findNextMacro(condText, end.endIndex);
					while (true) {
						if (ifDepth === 0 && end.command === "endif") {
							break;
						} else if (end.command === "endif") {
							ifDepth--;
						} else if (end.command === "if") {
							ifDepth++;
						}

						end = findNextMacro(condText, end.endIndex);
					}
				}

				end = findNextMacro(condText, end.endIndex);
			}

			// evaluate current macro
			var cond = (current.command === "if" || current.command === "elseif") ? evalConditionalString(
					current.content, vars) : true;
			if (cond) {
				return parseText(condText.substring(current.endIndex, end.startIndex), vars);
			}

			// else, move on to next conditional section
			if (end.command === "endif")
				break;
			current = end;
		}

		return "";
	};

	var parseText = function(rawText, vars) {

		// rename text for simplicity's sake
		var parsedText = rawText;

		// find each macro and remove until no macros remain
		while (true) {

			var macro = findNextMacro(parsedText, 0);
			if (macro === null)
				break;

			var replaceString = "";

			switch (macro.command) {
			case "print":
				if (macro.content.charAt(0) === "$") {
					replaceString = vars.getValue(macro.content.substring(1));
				} else {
					replaceString = getSceneParsedText(macro.content);
				}
				break;
			case "link":
				var linkArray = macro.content.split(" ");
				var linkTarget = linkArray[0];
				var linkText = linkTarget;
				if (linkArray.length > 1) {
					linkArray.splice(0, 1);
					var linkText = linkArray.join(" ");
				}

				if (linkHandling === "automatic") {
					replaceString = '<a href="' + linkTarget + '" class="handled">' + linkText + '</a>';
				} else {
					linkSet.addLink(linkTarget, macro.content);
				}
				break;
			case "back":
				var backText = "Back";
				if (macro.content !== "") {
					backText = macro.content;
				}
				if (linkHandling === "automatic") {
					replaceString = '<a href="back" class="handled" id="back">' + backText + '</a>';
				} else {
					linkSet.back = true;
					linkSet.backText = backText;
				}
				break;
			case "if":
				// if macro
				var startMacro = macro;

				// find endif macro
				var ifDepth = 0;

				macro = findNextMacro(parsedText, macro.endIndex);
				while (true) {
					if (macro.command === "if") {
						ifDepth++;
					} else if (macro.command === "endif") {
						if (ifDepth === 0) {
							break;
						} else {
							ifDepth--;
						}
					}
					macro = findNextMacro(parsedText, macro.endIndex);
				}

				// set macro values so string replacing works properly
				macro.startIndex = startMacro.startIndex;

				// call special recursive function for parsing conditional branches
				replaceString = parseConditional(parsedText.substring(macro.startIndex, macro.endIndex), vars);

				break;
			default:
				// eval(macro);
				throw {
					name : "illegal argument exception",
					message : "unknown macro found"
				};
			}

			// the macros MUST be removed otherwise the loop will never exit
			parsedText = parsedText.substring(0, macro.startIndex) + replaceString
					+ parsedText.substring(macro.endIndex);
		}

		// console.debug(parsedText);

		return parsedText;
	};

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

	// Variables private class
	var Variables = function(initial) {
		this.values = initial;
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
		return parseText(this.getRawText(), vars);
	};

	Scene.prototype.getParsedTextAsHtml = function(vars) {
		var parsedText = this.getParsedText(vars);
		var html = converter.makeHtml(parsedText);

		return html;
	};

	// History private class
	var History = function() {
		this.stack = [];
		this.current = null;
	};

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

	// LinkSet private class
	var LinkSet = function() {
		this.links = [];
		this.back = false;
	};

	LinkSet.prototype.addLink = function(sceneId, linkText) {
		this.links.push({
			scene : sceneId,
			text : linkText
		});
	};

	LinkSet.prototype.numLinks = function() {
		return this.links.length;
	};

	// HyperText main functions
	HyperText.init = function(config) {

		// I - read values from config
		// I.a - get baseUrl
		if (typeof config.baseUrl !== undefined && typeof config.baseUrl === "string") {
			if (config.baseUrl.lastIndexOf("/") == config.baseUrl.length - 1)
				baseUrl = config.baseUrl;
			else
				baseUrl = config.baseUrl + "/";
		}

		// I.b - get variables object
		if (typeof config.variables !== undefined) {
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
		if (!hasScene("start")) {
			throw "starting file must contain a scene with id 'start'.";
		}

		// III.b - load remaining files
		for ( var i = 0, len = fileList.length; i < len; i++)
			loadFileAndParseScenes(fileList[i]);

		// III.c - display start screen
		displayScene("start");

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

	HyperText.getSceneParsedText = function(id) {
		return getScene(id).getParsedText();
	};

	var getSceneHtml = HyperText.getSceneHtml = function(id) {
		return getScene(id).getParsedTextAsHtml(variables);
	};

	var displayScene = HyperText.displayScene = function(sceneId) {
		console.debug("displaying: " + sceneId);

		// I - display linked scene
		// I.a - clear display frame
		display.html("");

		// I.b - display next scene
		if (linkHandling === "manual")
			linkSet = new LinkSet();
		display.html(getSceneHtml(sceneId));

		// II - background handling
		// II.a - push new scene to history
		history.pushScene(sceneId);

		// II.b - add link handler to new scene links
		if (linkHandling === "automatic") {
			$("a").click(function(e) {
				e.stopPropagation();
				e.preventDefault();
				HyperText.linkHandler(e);
			});
		} else {
			linkHandler(linkSet);
		}

	};

	HyperText.linkHandler = function(e) {
		if (linkHandling === "automatic") {
			if ($(e.target).attr("id") === "back") {
				displayScene(history.popScene());
			} else {
				var targetScene = $(e.target).attr("href");
				displayScene(targetScene);
			}
		} else {
			if (e === HyperText.BACK) {
				displayScene(history.popScene());
			} else {
				displayScene(e);
			}
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
