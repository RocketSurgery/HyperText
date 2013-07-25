(function(window, undefined) {

	// The top-level namespace. All public HyperText classes and modules will be attached to this.
	var HyperText = (function() {
		return {};
	});

	// PRIVATE VARIABLES

	// configuration variables
	var baseUrl = null;
	var defaultContext = null;
	var fileList = null;

	// engine variables
	var formatter = null;
	var scenes = null;
	var history = null;

	// DEFAULT MACROS
	var macros = HyperText.macros = {};

	macros['print'] = {
		handler : function(macro, parser, context) {

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

	// HYPERTEXT MAIN FUNCTION

	HyperText.init = function(config) {

		// Initialize Variables
		baseUrl = "";
		history = [];
		fileList = [];
		scenes = {};
		
		// Read Values From Config and Perform Validity Checking
		// get baseUrl
		if (typeof config.baseUrl !== undefined && typeof config.baseUrl === "string") {
			if (config.baseUrl.lastIndexOf("/") == config.baseUrl.length - 1)
				baseUrl = config.baseUrl;
			else
				baseUrl = config.baseUrl + "/";
		}

		// get context object
		if (typeof config.context !== undefined) {
			defaultContext = config.context;
		}
		
		// get custom macros
		if (typeof config.macros !== undefined) {
			var key = null;
			for (key in config.macros) {
				if (config.macros.hasOwnProperty(key)) {
					macros[key] = config.macros[key];
				}
			}
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

		// Perform Final Setup
		// load remaining files
		for ( var i = 0, len = fileList.length; i < len; i++) {
			HyperText.loadFileAndParseScenes(fileList[i]);
		}

	};

	HyperText.hasScene = function(id) {
		return (typeof scenes[id] !== undefined);
	};

	HyperText.getScene = function(id) {
		if (hasScene(id)) {
			return scenes[id];
		} else {
			throw "Scene " + id + " does not exist or has not been loaded";
		}
	};

	HyperText.getSceneHtml = function(id) {
		return getScene(id).getParsedTextAsHtml(variables);
	};

	HyperText.displayScene = function(sceneId, outputLoc) {
		console.debug("displaying: " + sceneId);

		// I - display linked scene
		// I.a - clear display frame
		display.html("");

		// I.b - TODO display next scene

		// II - background handling
		// II.a - push new scene to history
		pushHistory(sceneId);

	};

	HyperText.back = function() {
		
	};

	HyperText.parseScenesFromText = function(file) {

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
			scenes[id] = sceneText;
		}
	};

	HyperText.loadFileAndParseScenes = function(URL) {
		var oReq = new XMLHttpRequest();
		oReq.onload = function() {
			HyperText.parseScenesFromText(this.responseText);
		};
		oReq.open("get", URL, true);
		oReq.send();
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
