(function(window, undefined) {

	// The top-level namespace. All public HyperText classes and modules will be
	// attached to this.
	var HyperText = (function() {
		return {};
	});

	// configuration variables
	var baseUrl = null;
	var defaultContext = null;
	var files = null;
	var filesLoaded = null;
	var passages = null;
	var onReady = null;
	var converter = null;

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
				// print passage
				// TODO output passage content
			}
		}
	};

	macros['if'] = {
		handler : function(macro, parser, context) {

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
						// after loop, end will be set to the endif
						// corresponding to the previous if macro
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
					parseAndOutputPassageText(condText.substring(current.endIndex, end.startIndex));
					return;
				}

				// else, move on to next conditional section
				if (end.command === "endif")
					break;
				current = end;
			}
		},
		evalConditionalString : function(condText) {
			var condArray = condText.split(" ");
			for ( var i = 0; i < condArray.length; i++) {
				if (condArray[i].charAt(0) === "$") {
					condArray[i] = "variables.pvalues." + condArray[i].substring(1);
				}
			}
			condText = condArray.join(" ");
			console.debug("condText: " + condText);
			return eval(condText);
		}
	};

	// PUBLIC VARIABLES
	HyperText.BACK = "com.github.rocketsurgery.hypertext.BACK";

	// UTILITY PRIVATE METHODS

	/*
	 * Parser
	 * 
	 * purpose: Parse the macros out of a passage's text and display the resulting content
	 * 
	 * description: The Parser constructor takes in the passage rawtext, and then moves forward to each macro,
	 * outputting the text in between as it goes. For each macro, it calls the appropriate macro's handler function. The
	 * handler function is passed (in order) the macro object, the parser object, and the context.
	 */

	var Parser = function(source) {
		this.source = source;
		this.current = 0;
		this.parsed = "";
		this.HTML = null;
		this.DOM = null;
		this.macros = [];
	};

	Parser.placeholder = "<span class=\"placeholder\"></span>";

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
			content : content,
			params : params,
			startIndex : startIndex,
			endIndex : endIndex + 2
		};
	};

	Parser.parsePassageText = function(source, context) {

		var parser = new Parser(source);

		var macro = parser.findNextMacro(parser.current);
		while (macro !== null) {

			// append text between macros
			parser.parsed += parser.source.substring(parser.current, macro.startIndex);

			// move parser.current forward
			parser.current = macro.startIndex;

			// Call Macro Function
			var macroValue = null;
			if (typeof macros[macro.command] !== 'undefined' && macros.hasOwnProperty(macro.command)) {
				macroValue = macros[macro.command].handler(macro, parser, context);
			} else {
				macroValue = macros["default"].handler(macro, parser, context);
			}

			// Add Macro To Parsed
			if (typeof macroValue === "string") {
				// append macroValue
				parser.parsed += macroValue;
			} else if (macroValue instanceof Parser) {

				// append parsed text for returned Parser
				parser.parsed = macroValue.parsed;

				// append macro values for returned Parser
				parser.macros.splice(parser.macros.length, 0, macroValue.macros);
			} else if (typeof macroValue !== 'undefined') {

//				console.debug(macroValue);
				
				// append placeholder and store returned value
				parser.parsed += Parser.placeholder;
				parser.macros.push(macroValue);
			}

			// move parser.current ahead if macro function didn't
			if (parser.current === macro.startIndex) {
				parser.current = macro.endIndex;
			}

			macro = parser.findNextMacro(parser.current);

		}

		// append final section of text
		parser.parsed += parser.source.substring(parser.current);
		parser.current = parser.source.length;

		// return parser
		return parser;
	};

	/**
	 * Parser.format()
	 * 
	 * Converts parsed markdown (Parser.parsed) to an html string (Parser.html) and a DOM (Parser.dom).
	 * 
	 */

	Parser.prototype.format = function() {
		// format markdown to html string
		var html = converter.makeHtml(this.parsed);

		// create wrapper element and add formatted html
		this.DOM = document.createElement("div");
		this.DOM.innerHTML = html;

		// replace placeholders
		var placeholders = this.DOM.getElementsByClassName("placeholder");
		var len = placeholders.length;

//		console.debug(placeholders);
//		console.debug(this.macros);

		for ( var i = 0; i < len; i++) {
			placeholders[0].parentNode.replaceChild(this.macros[i], placeholders[0]);
//			console.debug(placeholders);
		}

		// get parsed plaintext
		this.HTML = this.DOM.innerHTML;

	};

	/*
	 * Passage
	 * 
	 * purpose: act as a wrapper class for passages of text, and provide utility methods for accessing, parsing, and
	 * formatting the text.
	 */

	var Passage = function(rawText) {
		this.raw = rawText;
	};

	Passage.prototype.getRawText = function() {
		return this.raw;
	};

	Passage.prototype.getParsedText = function(context) {

		// parse and format passage
		var parser = Parser.parsePassageText(this.raw, context);
		parser.format();

		// return parsed passage as text
		return parser.DOM.textContent;
	};

	Passage.prototype.getParsedHTML = function(context) {

		// parse and format passage
		var parser = Parser.parsePassageText(this.raw, context);
		parser.format();

		// return parsed passage as HTML
		return parser.HTML;
	};

	Passage.prototype.getParsedDOM = function(context) {

		// parse and format passage
		var parser = Parser.parsePassageText(this.raw, context);
		parser.format();

		// return parsed passage as DOM
		return parser.DOM;
	};

	// HYPERTEXT MAIN FUNCTION
	HyperText.init = function(config) {

		// Initialize Variables
		baseUrl = "";
		filesLoaded = 0;
		history = [];
		files = [];
		passages = {};
		converter = new Markdown.Converter();

		// Read Values From config and Perform Validity Checking
		// get baseUrl
		if (typeof config.baseUrl !== 'undefined' && typeof config.baseUrl === "string") {
			if (config.baseUrl.lastIndexOf("/") == config.baseUrl.length - 1)
				baseUrl = config.baseUrl;
			else
				baseUrl = config.baseUrl + "/";
		}

		// get context object
		if (typeof config.context !== 'undefined') {
			defaultContext = config.context;
		}

		// get custom macros
		if (typeof config.macros !== 'undefined') {
			var key = null;
			for (key in config.macros) {
				if (config.macros.hasOwnProperty(key)) {
					macros[key] = config.macros[key];
				}
			}
		}

		// get files
		if (typeof config.files !== 'undefined' && Object.prototype.toString.call(config.files) === '[object Array]') {

			// iterate over each string, append it to baseUrl, and add it to files
			for ( var i = 0, len = config.files.length; i < len; i++) {
				var file = baseUrl + config.files[i] + ".md";
				files.push(file);
			}

		} else {
			throw "config must have a value 'files', which must be an array of strings with addresses to your story files.";
		}

		// get onReady
		if (typeof config.onReady === "function") {
			onReady = config.onReady;
		} else {
			throw new Error("a function must be provided for config.onReady");
		}

		// Perform Final Setup
		// load remaining files
		for ( var i = 0, len = files.length; i < len; i++) {
			HyperText.loadPassages(files[i]);
		}

	};

	HyperText.isReady = function() {
		return filesLoaded === files.length;
	};

	HyperText.hasPassage = function(id) {
		return (typeof passages[id] !== 'undefined');
	};

	HyperText.getPassage = function(id) {
		if (this.hasPassage(id)) {
			return passages[id];
		} else {
			throw "Passage " + id + " does not exist or has not been loaded";
		}
	};

	HyperText.getPassageRaw = function(id) {
		return this.getPassage(id).raw;
	};

	HyperText.getPassageHTML = function(id, context) {

		// Pass Correct Context and Validity Checking
		if (!context) {
			if (defaultContext === null) {
				throw new Error(
						"A default context must be provided during initialization, or one must be passed into getPassageHtml()");
			}
			context = defaultContext;
		}

		// return parsed HTML
		return this.getPassage(id).getParsedHTML(context);
	};

	HyperText.getPassageText = function(id, context) {

		// Pass Correct Context and Validity Checking
		if (!context) {
			if (defaultContext === null) {
				throw new Error(
						"A default context must be provided during initialization, or one must be passed into getPassageHtml()");
			}
			context = defaultContext;
		}

		// Return Parsed Text
		return this.getPassage(id).getParsedText(context);
	};

	HyperText.getPassageDOM = function(id, context) {

		// Pass Correct Context and Validity Checking
		if (!context) {
			if (defaultContext === null) {
				throw new Error(
						"A default context must be provided during initialization, or one must be passed into getPassageHtml()");
			}
			context = defaultContext;
		}

		// Return Parsed DOM
		return this.getPassage(id).getParsedDOM(context);
	};

	HyperText.parsePassagesFromText = function(file) {

		file = new String(file);

		var index = file.indexOf("<<passage ");
		while (index != -1) {

			// get indices
			var properIndex = index + 10;
			var closeIndex = file.indexOf(">>", properIndex);

			// get id
			var id = file.substring(properIndex, closeIndex);
			index = file.indexOf("<<passage ", properIndex);

			// get passage text
			var passageText;
			if (index == -1)
				passageText = file.substring(closeIndex + 2);
			else
				passageText = file.substring(closeIndex + 2, index);

			// add passage to passages
			passages[id] = new Passage(passageText);
		}
	};

	HyperText.loadPassages = function(URL) {
		var oReq = new XMLHttpRequest();
		oReq.onload = function() {

			// parse passages from file
			HyperText.parsePassagesFromText(this.responseText);

			// if engine is ready, call onReady()
			filesLoaded++;
			if (HyperText.isReady()) {
				onReady();
			}

		};
		oReq.open("get", URL, true);
		oReq.send();
	};

	// AMD COMPLIENCE
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = HyperText;
	}

	if (typeof define === "function" && define.amd) {
		define("hypertext", [], function() {
			return HyperText;
		});
	}

	// If there is a window object, that at least has a document property,
	// define HyperText
	if (typeof window === "object" && typeof window.document === "object") {
		window.HyperText = HyperText;
	}

})(window);
