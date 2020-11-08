import * as Util from "./util.js";
import * as Sfd from "./stockfish-driver.js";


//
// GAME FLOW
//

function make_game_flow(position) {
    var root_node = {past_node: null,
		     future_nodes: [],
		     position: position};
    return {root_node: root_node,
	    selected_node: root_node};
}

function game_flow_get_position(game_flow) {
    return game_flow.selected_node.position;
}

//
// GAME
//

function update_analysis_info_cb(info) {
    console.log("Model: update_analysis_info_cb");
}

// Name does not have to be unique.
function make_game(name) {
    var position = Util.make_start_position();
    var game_flow = make_game_flow(position);

    var analysis_engine = new Sfd.Stockfish("analyzer", update_analysis_info_cb, 3);
    var analysis_engine_pc = analysis_engine
	.init()
	.then(() => analysis_engine.set_start_position());

    var mode = "user vs user";
    var turn = "W";
    
    return {name: name,
	    game_flow: game_flow,
	    analysis_engine: analysis_engine,
	    analysis_engine_pc: analysis_engine_pc,
	    mode: mode,
	    turn: turn};
}

function game_get_position(game) {
    return game_flow_get_position(game.game_flow);
}

function game_perform_move(game, from, to) {
    console.log("Performing move " + from + " -> " + to);
    // TODO check if move is valid.
    var position = game_get_position(game);
    position[to[0]][to[1]] = position[from[0]][from[1]];
    position[from[0]][from[1]] = null;
    // TODO take into account castle, en passent, etc. Maybe use a tool for FEN manipulation.

    game_toggle_turn(game);
    return true;
}

function game_toggle_turn(game) {
    if (game.turn == "W")
	game.turn = "B";
    else
	game.turn = "W";
}



export {
    make_game,
    game_get_position,
    game_perform_move
};

console.log("MODEL LOADED.");



