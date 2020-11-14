import * as Util from "./util.js";
import * as Sfd from "./stockfish-driver.js";


//
// GAME FLOW
//

function make_game_flow(fen) {
    var root_node = {past_node: null,
		     future_nodes: [],
		     fen: fen};
    return {root_node: root_node,
	    selected_node: root_node};
}

function game_flow_get_fen(game_flow) {
    return game_flow.selected_node.fen;
}

//
// GAME
//

// Name does not have to be unique.
function make_game(name, mode, user_color, update_info_cb) {
    var chess = new Chess();
    var game_flow = make_game_flow(chess.fen());

    var analysis_engine = new Sfd.Stockfish("analyzer", update_info_cb, 3);
    var analysis_engine_pc = analysis_engine
	.init()
	.then(() => analysis_engine.set_start_position());

    //var mode = "user vs user";
    //var mode = "user vs computer";
    var mode = mode;
    var user_color = user_color; // This is meaningfull when playing against computer.

    var opponent_engine = null;
    var opponent_engine_pc = null;
    if (mode == "user vs computer") {
	opponent_engine = new Sfd.Stockfish("opponent", null, 1);
	opponent_engine_pc = opponent_engine
	    .init()
	    .then(() => opponent_engine.set_start_position());
    }
    
    return {name: name,
	    chess: chess,
	    game_flow: game_flow,
	    analysis_engine: analysis_engine,
	    analysis_engine_pc: analysis_engine_pc,
	    opponent_engine: opponent_engine,
	    opponent_engine_pc: opponent_engine_pc,
	    mode: mode,
	    user_color: user_color};
}

function game_get_position(game) {
    var chess_position = game.chess.board();
    var position = Util.make_8x8_null_array();
    for (var x=0; x<8; x++) {
	for (var y=0; y<8; y++) {
	    var piece = chess_position[7-y][x];
	    if (piece) {
		position[x][y] = piece.color.toUpperCase() + piece.type.toUpperCase();
	    }
	}
    }
    return position;
}


function game_perform_move(game, from, to) {
    var nfrom = Util.position_index_to_name(...from);
    var nto = Util.position_index_to_name(...to);
    var is_valid = game.chess.move({from: nfrom, to: nto});
    //console.log(is_valid);
    if (is_valid) {
	console.log("Performing move " + nfrom + " -> " + nto);

	var fen = game.chess.fen();
	
	game.analysis_engine_pc = game.analysis_engine_pc.then(() => {
	    game.analysis_engine.set_position_with_fen(fen);
	});
	if (game.opponent_engine) {
	    game.opponent_engine_pc = game.opponent_engine_pc.then(() => {
		game.opponent_engine.set_position_with_fen(fen);
	    });
	}
    }
    return is_valid;
}


function game_opponent_perform_move(game, post_move_cb) {
    game.opponent_engine_pc = game.opponent_engine_pc.then(() => {
	return game.opponent_engine.perform_analysis(2);
    }).then((info_msgs) => {
	var bestmove = info_msgs[0].pv[0];
	var [from, to] = Util.position_move_to_index(bestmove);

	game_perform_move(game, from, to);
	if (post_move_cb)
	    post_move_cb(from, to);
    });
}


function game_perform_analysis(game) {
    game.analysis_engine_pc = game.analysis_engine_pc.then(() => {
	game.analysis_engine.perform_analysis();
    });
}


function game_get_turn(game) {
    return game.chess.turn().toUpperCase();
}


export {
    make_game,
    game_get_position,
    game_perform_move,
    game_opponent_perform_move,
    game_get_turn,
    game_perform_analysis
};

console.log("MODEL LOADED.");



