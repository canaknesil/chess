import * as View from "./view.js";
import * as Model from "./model.js";


//
// STATUS
//
var games = [];
var selected_game = null;


var new_game_id_count = 0;
function new_game() {
    var game = Model.make_game("Game " + new_game_id_count.toString());
    games.push(game);
    selected_game = game;
    var position = Model.game_get_position(selected_game);
    View.update_from_position(position);
}

function get_current_position() {
    return game_get_position(selected_game);
}

function click_square(x, y) {
    //console.log([x, y] + " clicked.");
    // Possible actions:
    // select piece
    // move piece
    // put piece
    // etc.

    // Temporary behavior
    if (View.is_square_marked(x, y))
	View.unmark_square(x, y)
    else
	View.mark_square(x, y)
}

View.add_listener({
    new_game_onclick: new_game,
    square_onclick: click_square
});

console.log("CONTROLLER LOADED.");
