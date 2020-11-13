import * as View from "./view.js";
import * as Model from "./model.js";
import * as Util from "./util.js";

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
    return Model.game_get_position(selected_game);
}


var selected_square = null;
var previous_src_square = null;
var previous_dest_square = null;
var current_src_square = null;
var current_desk_square = null;

function post_move(from, to, opponent=false) {
    var [x, y] = to;
    var [prev_x, prev_y] = from;
    
    current_desk_square = [x, y];
    
    if (previous_src_square)
	View.unmark_square(...previous_src_square);
    if (previous_dest_square)
	View.unmark_square(...previous_dest_square);
    View.mark_square(...from);
    View.mark_square(...to);
    
    View.perform_move(from, to, true, function() {
	View.update_from_position(Model.game_get_position(selected_game));

	// TODO: Game mode should be checked here.
	if (opponent) {
	    Model.game_opponent_perform_move(selected_game, function post_move_cb(from, to) {
		console.log("Opponent moving " + Util.position_index_to_name(...from) + " -> " + Util.position_index_to_name(...to));
		post_move(from, to);
	    });
	}
	    
    });
    
    previous_src_square = current_src_square;
    previous_dest_square = current_desk_square;
    current_src_square = null;
    current_desk_square = null;
}

function click_square(x, y) {
    // move piece
    var piece = Model.game_get_position(selected_game)[x][y];
    if (piece && Model.game_get_turn(selected_game) == piece[0]) {
	// Select / unselect square
	if (current_src_square && Util.array_equal(current_src_square, [x, y])) {
	    View.unmark_square(...current_src_square);
	    current_src_square = null;
	} else if (current_src_square) {
	    View.unmark_square(...current_src_square);
	    View.mark_square(x, y);
	    current_src_square = [x, y];
	} else {
	    View.mark_square(x, y);
	    current_src_square = [x, y];
	}
    } else if (current_src_square) {
	// Move piece
	if (Model.game_perform_move(selected_game, current_src_square, [x, y])) {
	    post_move(current_src_square, [x, y], true);
	}
    }

    //console.log([x, y] + " clicked.");
    // Possible actions:
    // select piece
    // move piece
    // put piece
    // etc.

    // Temporary behavior
    // if (View.is_square_marked(x, y))
    // 	View.unmark_square(x, y)
    // else
    // 	View.mark_square(x, y)
}


View.add_listener({
    new_game_onclick: new_game,
    square_onclick: click_square
});

console.log("CONTROLLER LOADED.");
