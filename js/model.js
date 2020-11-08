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

// Name does not have to be unique.
function make_game(name) {
    var position = Util.make_start_position();
    var game_flow = make_game_flow(position);
    return {name: name,
	    game_flow: game_flow};
}

function game_get_position(game) {
    return game_flow_get_position(game.game_flow);
}



export {
    make_game,
    game_get_position
};

console.log("MODEL LOADED.");



