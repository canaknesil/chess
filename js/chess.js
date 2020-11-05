//
// UTIL
//

function make_8x8_null_array() {
    return [[null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null]];
}

//
// POSITION
//

// position[A-H][1-8]

function make_empty_position() {
    return make_8x8_null_array();
}

function make_start_position() {
    return [[null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, "BK"],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null],
	    [null, null, null, null, null, null, null, null]];
}

function position_to_string(position) {
    var str = "";
    for (var i=7; i>=0; i--) {
	for (var j=0; j<8; j++) {
	    piece = position[j][i];
	    str += (piece ? piece + " " : "-- ");
	}
	str += "\n";
    }
    return str;
}

function position_get_piece_by_name(position, square_name) {
    var [i, j] = position_name_to_index(square_name);
    piece = position[i][j];
    return piece;
}

function position_get_piece_by_index(position, i, j) {
    if (i<0 || i>7 || j<0 || j>7) {
	throw new Error("Invalid position index");
    }
    return position[i][j];
}

function position_index_to_name(i, j) {
    if (i<0 || i>7 || j<0 || j>7) {
	throw new Error("Invalid position index");
    }
    name = String.fromCharCode('a'.charCodeAt() + i)
	+ String.fromCharCode('1'.charCodeAt() + j);
    return name;
}

function position_name_to_index(square_name) {
    if (square_name.length != 2 || square_name[0] < 'a' || square_name[0] > 'h' || square_name[1] < '0' || square_name[1] > 8) {
	throw new Error("Invalid square name");
    }
    var i = square_name[0].charCodeAt() - 'a'.charCodeAt();
    var j = square_name[1].charCodeAt() - '1'.charCodeAt();
    return [i, j];
}


//
// GAME FLOW
//

function make_game_flow(position) {
    root_node = {past_node: null,
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
    position = make_start_position();
    game_flow = make_game_flow(position);
    return {name: name,
	    game_flow: game_flow};
}

function game_get_position(game) {
    return game_flow_get_position(game.game_flow);
}

//
// STATUS
//

var games = [];
var selected_game = null;

//
// INTERFACE TO GUI
//

var new_game_id_count = 0;
function new_game() {
    game = make_game("Game " + new_game_id_count.toString());
    games.push(game);
    selected_game = game;
    position = game_get_position(selected_game);
    gui_update_from_position(position);
}

//
// GUI
//

var gui_board = document.getElementById("board");

var gui_position = make_8x8_null_array();


function gui_new_piece(piece_type, x, y) {
    var new_piece = document.createElement("img");
    new_piece.src = "/images/pieces/classic/" + piece_type + ".svg";
    new_piece.classList.add("piece");
    new_piece.classList.add(piece_type);
    new_piece.setAttribute("piece_type", piece_type);
    gui_board.appendChild(new_piece);
    gui_move_piece(new_piece, x, y);
    
}

Velocity.defaults.fpsLimit = 30; // Default is 60. It must be factors of 60.

// This removes the piece at the destination square, if exists.
function gui_move_piece(piece, x, y) {
    old_piece = gui_position[x][y];
    if (old_piece != null) {
	gui_remove_piece(x, y);
    }
    var square_size = document.getElementById("a1").getBoundingClientRect().width;
    Velocity(piece, {left: x * square_size,
		     top: (7 - y) * square_size},
	     {duration: 400,
	      complete: function(elements, activeCall) {
		  piece.style.setProperty("left", "calc(" + x + " * var(--square-size))");
		  piece.style.setProperty("top", "calc((7 - " + y + ") * var(--square-size))");
	      }});
    
    gui_position[x][y] = piece;
}

// If piece does not exist don't do anything. 
function gui_remove_piece(x, y) {
    piece = gui_position[x][y];
    if (piece != null) {
	piece.remove();
	gui_position[x][y] = null;
    }
}

function gui_update_from_position(position) {
    console.log("gui_update_from_position");
    console.log(position_to_string(position));

    for (var i=0; i<8; i++) {
	for (var j=0; j<8; j++) {
	    var square_name = position_index_to_name(i, j);
	    var piece_type = position_get_piece_by_index(position, i, j);
	    var gui_piece = gui_position[i][j];
	    var gui_piece_type = (gui_piece == null ? null : gui_piece.getAttribute("piece_type"));
	    if (gui_piece_type != piece_type) {
		gui_new_piece(piece_type, i, j);
	    }
	}
    }
}

function new_game_onclick() {
    new_game();
}

function square_onclick(id) {
    console.log(id + " clicked.");
}

// Test
new_game_onclick()
position = game_get_position(selected_game);
gui_update_from_position(position);
gui_update_from_position(position);

