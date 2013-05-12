// variable to hold game manifest
var manifest;
var scenes = {};
var TEXT_FOLDER = "text/";

/**
 * A unique identifier for the current game, used to ensure that the save files
 * for the game do not overlap with another game.
 */
var GAME_ID = null;

/**
 * Loads the manifest and all resource files.
 * 
 * @since 1.0
 */
function init(id) {

	// establish games unique identifier
	GAME_ID = id;

	// load manifest.xml and store in $manifest
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET", "manifest.XML", false);
	xmlhttp.send();
	manifest = xmlhttp.responseXML;

	// load source files from manifest
	$(manifest).find("source").each(function() {

		// load each file as xml dom
		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest();
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttp.open("GET", TEXT_FOLDER + $(this).attr("src"), false);
		xmlhttp.send();
		var story = xmlhttp.responseXML;

		// add each value to scenes list
		$(story).find("scene").each(function() {
			var id = $(this).attr("id");
			scenes[id] = this;
		});

	});

	console.log(size(scenes) + " scenes loaded");
}

// text-generation functions

/**
 * Parse the given scene and replace var and cond tags with appropriate text,
 * then return the formatted html.
 * 
 * @param s
 *            A jQuery object containing the scene to be parsed.
 * @return The formatted scene text as html
 * @since 1.0
 */
function formatScene(s) {

	var scene = $(s).clone();

	// replace var tags with proper content
	$(scene).find("var").replaceWith(function() {
		return eval($(this).attr("name"));
	});

	// replace cond tags with proper content
	$(scene).find("cond").replaceWith(function() {
		var cond = generateConditionalText(this);
		return cond;
	});

	// format remaining tags as html
	var node = document.createElement("p");
	$(scene).contents().each(function() {
		$(node).append(this);
	});
	$(node).html($(node).html());

	// remove duplicate br tags
	var removeFlag = false;
	$(node).find("br").each(function() {
		if (removeFlag) {
			this.remove();
			removeFlag = false;
		} else {
			removeFlag = true;
		}
	});

	return $(node).html();
}

/**
 * Parses and evaluates the supplied conditional tag and returns the appropriate
 * text.
 * 
 * @param cond
 *            An object representing the a cond tag.
 * @returns A string with the appropriate text based on the evaluation of the
 *          conditional.
 * @since 1.0
 */
function generateConditionalText(cond) {
	var returnVal = null;
	var result = eval($(cond).find("if").attr("logic"));
	if (result)
		return $(cond).find("if").text();
	$(cond).find("elseif").each(function() {
		result = eval($(this).attr("logic"));
		if (result) {
			returnVal = $(this).text();
			return;
		}
	});
	if (returnVal)
		return returnVal;
	return $(cond).find("else").text();
}

// save functions

/**
 * Save the key-value pairs provided in data with the unique identifier
 * provided. Ignores functions. Only keys with values (null or an object) are
 * saved, unassigned keys are ignored.
 * 
 * @param file
 *            A unique identifier for the data to be saved.
 * @param data
 *            An associative array with key-value pairs to be saved.
 * @since 1.0
 */
function save(id, data) {
	console.log("saving under id: " + id);
	var key = null;
	for (key in data) {
		if (data.hasOwnProperty(key) && !_.isFunction(data[key])) {
			var k = GAME_ID + id + key;
			console.log("saving - " + key + ":" + data[key]);
			localStorage[k] = data[key];
		}
	}
}

/**
 * Load the data identified by id. Ignores functions in keys. Will not load
 * empty keys, so keys must at least be assigned null or some value, though the
 * values will be ignored.
 * 
 * @param file
 *            the identifier of the file attempting to be loaded.
 * @return the save file if it exists, false otherwise.
 * @since 1.0
 */
function load(id, keys) {
	var pairs = {};
	var key = null;
	for (key in keys) {
		var k = GAME_ID + id + key;
		if (localStorage.hasOwnProperty(k) && !_.isFunction(keys[key])) {
			var value = localStorage[k];
			console.log("loading - " + k + ":" + value + " to " + key);
			pairs[key] = value;
		}
	}
	console.debug("loaded: " + pairs);
	return pairs;
}

// utility functions

/**
 * Utility function for XML greater-than operations.
 * 
 * @param first
 * @param second
 * @return first > second
 */
function gt(first, second) {
	return first > second;
}

/**
 * Utility function for XML greater-than-or-equals operations.
 * 
 * @param first
 * @param second
 * @return first >= second
 */
function gte(first, second) {
	return first >= second;
}

/**
 * Utility function for XML less-than operations.
 * 
 * @param first
 * @param second
 * @returns first < second
 */
function lt(first, second) {
	return first < second;
}

/**
 * Utility function for XML less-than-or-equals operations.
 * 
 * @param first
 * @param second
 * @returns first <= second
 */
function lte(first, second) {
	return first <= second;
}

/**
 * Utility function for XML and operations.
 * 
 * @param first
 * @param second
 * @returns first && second
 */
function and(first, second) {
	return first && second;
}

/**
 * Utility function for XML or operations. It is not necessary to use this
 * function in your story files, as the '|' character is not a special character
 * in XML. This function is included for consistency.
 * 
 * @param first
 * @param second
 * @returns first || second
 */
function or(first, second) {
	return first || second;
}

/**
 * Utility function for XML equals operations. It is not necessary to use this
 * function in your story files, as the '=' character is not a special character
 * in XML. This function is included for consistency.
 * 
 * @param first
 * @param second
 * @return first == second
 */
function e(first, second) {
	return first == second;
}

/**
 * Utility function for XML not-equals operations. It is not necessary to use
 * this function in your story files, as the '!' character and '=' are not a
 * special characters in XML. This function is included for consistency.
 * 
 * @param first
 * @param second
 * @return first != second
 */
function ne(first, second) {
	return first != second;
}

/**
 * Utility function for XML negation operations. It is not necessary to use this
 * function in your story files, as the '!' character and '=' are not a special
 * characters in XML. This function is included for consistency.
 * 
 * @param first
 * @return !first
 */
function not(first) {
	return !first;
}
