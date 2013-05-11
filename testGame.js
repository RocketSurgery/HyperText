// game variables
var game = new function() {
	this.pcName = null;
	this.pcHeight = null;
	this.numLoads = null;

	this.pcHeightUnits = function() {
		return heightUnits(this.pcHeight);
	};

	this.pcHeightWithUnits = function() {
		return game.pcHeight + " " + this.pcHeightUnits();
	};

	this.setData = function(data) {
		var key = null;
		for (key in data) {
			this[key] = data[key];
		}
	};
};

function test() {

	var values = load(2, game);
	game.setData(values);

	if (game.numLoads == null) {
		game.pcName = "Hellen";
		game.pcHeight = 5.7;
		game.numLoads = 0;
	} else {
		game.numLoads++;
	}
	
	console.debug(game.numLoads);

	save(2, game);

	// var scene = scenes["intro1"];
	// scene = formatScene(scene);
	//
	// $("#main").append($(document.createElement("p")).html(scene));

}

// functions for
function heightUnits(h) {
	return (h == 1) ? "foot" : "feet";
}