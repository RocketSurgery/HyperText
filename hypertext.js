(function(window, undefined) {

	// Establish the root object, window in the browser, or global on the server.
	var root = window;

	// The top-level namespace. All public HyperText classes and modules will
	// be attached to this.
	var HyperText = (function() {
		return {};
	});

	// PRIVATE VARIABLES

	// configuration variables
	var baseUrl = "";
	var variables = null;
	var fileList = [];
	var display = null;

	// engine variables
	var formatter = null;
	var scenes = {};
	var history = null;
	var linkSet = null;

	// DEFAULT MACROS
	var macros = HyperText.macros = {};

	macros['print'] = {
		handler : function(macro, parser) {

			// VALIDITY CHECKING
			if (macro.params.length !== 1) {
				throw new Error("print macro must have exactly one parameter");
			}

			// get value to output
			if (macro.params[0].charAt(0) === "$") {
				// print variable
				var value = variables.values[macro.params[0].substring(1)];
				// TODO output inline value
			} else {
				// print scene
				// TODO output scene content
			}
		}
	};

	macros['if'] = {
		handler : function(macro, parser) {

			var current = macro;

			// find correct text block
			while (true) {

				// find closing macro
				var end = parser.findNextMacro(current.endIndex);
				while (true) {
					if (end.command === "elseif" || end.command === "else" || end.command === "endif") {
						break;
					} else if (end.command === "if") {

						// parse out of nested if blocks
						// after loop, end will be set to the endif corresponding to the previous if macro
						var depth = 0;
						end = parser.findNextMacro(end.endIndex);
						while (true) {
							if (depth === 0 && end.command === "endif") {
								break;
							} else if (end.command === "endif") {
								depth--;
							} else if (end.command === "if") {
								depth++;
							}

							end = parser.findNextMacro(end.endIndex);
						}
					}

					end = parser.findNextMacro(end.endIndex);
				}

				// evaluate current macro
				var cond = (current.command === "if" || current.command === "elseif") ? evalConditionalString(current.params
						.join(" "))
						: true;
				if (cond) {
					parseAndOutputSceneText(condText.substring(current.endIndex, end.startIndex));
					return;
				}

				// else, move on to next conditional section
				if (end.command === "endif")
					break;
				current = end;
			}
		}
	};

	macros['link'] = {
		handler : function(macro, parser) {

			// VALIDITY CHECKING
			if (macro.params.length < 1) {
				throw new Error("link macro must have at least one argument");
			}

			var link = document.createElement("a");
			link.href = "javascript:void(0)";
			link.className = 'internalLink';

			if (macro.params.length === 1) {
				link.innerHTML = macro.params[0];
			} else {
				link.innerHTML = macro.params.slice(1, macro.params.length).splice(" ");
			}

			link.onclick = function() {
				macros['link'].execute(link, macro.params[0]);
			};

			// TODO output link

		},
		execute : function(link, target) {
			// TODO write link execute behavior
			parseAndOutputScene(target);
		}
	};

	macros['back'] = {
		handler : function(macro, parser) {
			var link = document.createElement("a");
			link.href = "javascript:void(0)";
			link.onclick = function() {
				macros['back'].execute();
			};
		},
		execute : function() {
			// TODO write back link execute behavior
		}
	};

	// PUBLIC VARIABLES
	HyperText.BACK = "com.github.rocketsurgery.hypertext.BACK";

	// UTILITY PRIVATE METHODS

	var Parser = function(source) {
		this.source = source;
		this.current = 0;
	};
	
	Parser.prototype.findNextMacro = function(startIndex) {
		var i = this.source.indexOf("<<", startIndex);

		// if no remaining macros, return null
		if (i === -1)
			return null;

		// denotes starting index of macro
		var startIndex = i;

		// denotes index of first close bracket of macro
		// macro includes all characters from startIndex through endIndex + 1
		var endIndex = i = this.source.indexOf(">>", i);

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
		var content = this.source.substring(startIndex + 2, endIndex);

		var macroArray = content.split(" ");
		var command = macroArray[0];
		content = content.substring(command.length + 1);
		var params = content.split(" ");

		return {
			command : command,
			params : params,
			startIndex : startIndex,
			endIndex : endIndex + 2
		};
	};

	Parser.evalConditionalString = function(condText) {
		var condArray = condText.split(" ");
		for ( var i = 0; i < condArray.length; i++) {
			if (condArray[i].charAt(0) === "$") {
				condArray[i] = "variables.pvalues." + condArray[i].substring(1);
			}
		}
		condText = condArray.join(" ");
		console.debug("condText: " + condText);
		return eval(condText);
	};

	Parser.parseConditional = function(condText) {

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
			var cond = (current.command === "if" || current.command === "elseif") ? evalConditionalString(current.content)
					: true;
			if (cond) {
				return parseText(condText.substring(current.endIndex, end.startIndex));
			}

			// else, move on to next conditional section
			if (end.command === "endif")
				break;
			current = end;
		}

		return "";
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
		var oReq = new XMLHttpRequest();
		oReq.onload = function() {
			parseScenesFromFile(this.responseText);
		};
		oReq.open("get", URL, false);
		oReq.send();
	};

	var loadFileAndParseScenesAsync = function(URL) {
		var oReq = new XMLHttpRequest();
		oReq.onload = function() {
			parseScenesFromFile(this.responseText);
		};
		oReq.open("get", URL, true);
		oReq.send();
	};

	/*
	 * Parser
	 * 
	 * purpose: Parse the macros out of a scene's text and display the resulting content
	 * 
	 * description: The Parser constructor takes in the scene rawtext, and then moves forward to each macro, outputting
	 * the text in between as it goes. For each macro, it calls the appropriate macro's handler function. The handler
	 * function is passed, in order, the macro object, and the parser object.
	 */
	var parseAndOutputSceneText = Parser.prototype.parseAndOutputSceneText = function(source) {

		var parser = new Parser(source);

		while (parser.current !== -1) {
			var next = parser.source.indexOf("<<", parser.current);
			if (next === -1) {
				// TODO output parseText.substring(this.current)
			} else {
				parser.current = next;
				var macro = parser.findNextMacro(parser.current);
				var tempCurrent = parser.current;

				macros[macro.command].handler(macro, parser);

				// move parser.current ahead if macro parser didn't
				if (tempCurrent === parser.current)
					parser.current = macro.endIndex;
			}
		}
	};

	var parseAndOutputScene = HyperText.parseAndOutputScene = function(sceneId) {
		parseAndOutputSceneText(scenes[sceneId]);
		flushOutput(); // TODO write function to flush output
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

	var pushHistory = HyperText.pushHistory = function(sceneId) {
		if (!hasScene(sceneId)) {
			throw {
				name : "illegal argument exception",
				message : "cannot push name of scene that doesn't exist"
			};
		}
		history.push(sceneId);
	};

	var popHistory = HyperText.popHistory = function() {
		if (history.length === 0) {
			throw {
				name : "stack exception",
				message : "cannot pop from an empty history"
			};
		} else if (history.length === 1) {
			history.pop();
			return null;
		}
		history.pop();
		return (history[history.length - 1]);
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
			variables = {
				pvalues : config.variables
			};
		}
		
		// get macro extensions
		if (config.macros) {
			var key = null;
			for (key in config.macros) {
				if (config.macros.hasOwnProperty(key)) {
					macros[key] = config.macros[key];
				}
			}
		}

		// I.c - get initial file
		var initial = null;
		if (typeof config.initial !== undefined && typeof config.initial === "string") {
			initial = baseUrl + config.initial + ".md";
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

		// I.g - get display frame
		if (typeof config.display !== undefined) {
			display = config.display;
		}

		// II - initialize variables
		history = [];

		// III - perform final setup
		// III.a - load initial file
		if (initial !== null) {
			loadFileAndParseScenesSync(initial);
		}

		// III.b - load remaining files
		for ( var i = 0, len = fileList.length; i < len; i++) {
			loadFileAndParseScenesAsync(fileList[i]);
		}

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

	var getSceneHtml = HyperText.getSceneHtml = function(id) {
		return getScene(id).getParsedTextAsHtml(variables);
	};

	var displayScene = HyperText.displayScene = function(sceneId, outputLoc) {
		console.debug("displaying: " + sceneId);

		// I - display linked scene
		// I.a - clear display frame
		display.html("");

		// I.b - display next scene
		if (linkDisplay === "manual")
			linkSet = new LinkSet();
		display.html(getSceneHtml(sceneId));

		// II - background handling
		// II.a - push new scene to history
		pushHistory(sceneId);

	};

	HyperText.back = function() {
		
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
