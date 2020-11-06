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
    return [["WR", "WP", null, null, null, null, "BP", "BR"],
	    ["WN", "WP", null, null, null, null, "BP", "BN"],
	    ["WB", "WP", null, null, null, null, "BP", "BB"],
	    ["WQ", "WP", null, null, null, null, "BP", "BQ"],
	    ["WK", "WP", null, null, null, null, "BP", "BK"],
	    ["WB", "WP", null, null, null, null, "BP", "BB"],
	    ["WN", "WP", null, null, null, null, "BP", "BN"],
	    ["WR", "WP", null, null, null, null, "BP", "BR"]];
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
// CONTROLLER
//

var new_game_id_count = 0;
function new_game() {
    game = make_game("Game " + new_game_id_count.toString());
    games.push(game);
    selected_game = game;
    position = game_get_position(selected_game);
    gui_update_from_position(position);
}

function get_current_position() {
    return game_get_position(selected_game);
}

function click_square(x, y) {
    console.log([x, y] + " clicked.");
    // Possible actions:
    // select piece
    // move piece
    // put piece
    // etc.
}

//
// GUI
//


var svg_ns = "http://www.w3.org/2000/svg"
var board_svg;

var gui_position = make_8x8_null_array();
var gui_orientation = "W";


// Draw chessboard
(function() {
    var board = document.getElementById("board");
    board_svg = document.createElementNS(svg_ns, "svg");
    
    board_svg.setAttribute("viewBox", "0 0 800 800");
    board_svg.setAttribute("id", "chessboard-svg");
    
    for (var x=0; x<8; x++) {
	for (var y=0; y<8; y++) {
	    var square = document.createElementNS(svg_ns, "rect");
	    
	    square.setAttribute("width", "100");
	    square.setAttribute("height", "100");
	    square.setAttribute("x", x * 100);
	    square.setAttribute("y", y * 100);
	    
	    if ((x + y) % 2 != 0)
		square.classList.add("square-dark");
	    else
		square.classList.add("square-light");
	    
	    var file = String.fromCharCode(x + 'a'.charCodeAt());
	    var rank = String.fromCharCode(7 - y + '1'.charCodeAt());
	    var id = file + rank;
	    square.setAttribute("id", id);
	    
	    square.setAttribute("onclick", "square_onclick(this.id)");
	    
	    board_svg.appendChild(square);
	}
    }
    
    board.appendChild(board_svg);
})();


function gui_new_piece(piece_type, x, y) {
    var img = document.createElementNS(svg_ns, "image");
    img.setAttribute("href", "/images/pieces/classic/" + piece_type + ".svg");
    img.setAttribute("x", 4 * 100); // Temporary. Will be changed immediately after creation.
    img.setAttribute("y", 4 * 100);
    img.setAttribute("height", "100");
    img.setAttribute("width", "100");
    
    img.classList.add("piece");
    img.classList.add(piece_type);
    img.setAttribute("piece_type", piece_type);

    board_svg.appendChild(img);
    gui_move_piece(img, x, y);
}

Velocity.defaults.fpsLimit = 30; // Default is 60. It must be factors of 60.

// This removes the piece at the destination square, if exists.
function gui_move_piece(piece, x, y, remove=true) {
    old_piece = gui_position[x][y];
    if (remove) {
	if (old_piece != null) {
	    gui_remove_piece(x, y);
	}
    }
    var square_size = 100;
    var board_x = x;
    var board_y = (gui_orientation == "W" ? y : 7 - y);
    Velocity(piece, {x: board_x * square_size,
		     y: (7 - board_y) * square_size},
	     {duration: 400
	      // ,complete: function(elements, activeCall) {
	      // 	  piece.style.setProperty("left", "calc(" + board_x + " * var(--square-size))");
	      // 	  piece.style.setProperty("top", "calc((7 - " + board_y + ") * var(--square-size))");
	      // }
	     });
    
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

// function gui_select_piece(x, y) {
//     piece = gui_position[x][y];
//     if (piece != null) {
// 	gui_unselect_piece();
// 	piece.classList.add("selected");
// 	gui_selected_piece = [x, y];
//     }
// }

// function gui_unselect_piece() {
//     if (gui_selected_piece != null) {
// 	var [x, y] = gui_selected_piece;
// 	element = gui_position[x][y];
// 	element.classList.remove("selected");
//     }
//     gui_selected_piece = null;
// }

function gui_mark_square(x, y) {
    // [x, y] -> a4, find by id.
}

function gui_unmark_square(x, y) {
}

function gui_update() {
    // Update piece positions
    for (var i=0; i<8; i++) {
	for (var j=0; j<8; j++) {
	    if (gui_position[i][j] != null) {
		piece = gui_position[i][j];
		gui_move_piece(piece, i, j, remove=false);
	    }
	}
    }
}


// Input from user

function new_game_onclick() {
    new_game();
}

function square_onclick(id) {
    var file = id.charCodeAt(0) - 'a'.charCodeAt();
    var rank = id.charCodeAt(1) - '1'.charCodeAt();
    if (gui_orientation == "B") {
	file = 7 - file;
	rank = 7 - rank;
	var file_letter = String.fromCharCode(file + 'a'.charCodeAt());
	var rank_number = String.fromCharCode(rank + '1'.charCodeAt());
	id = file_letter + rank_number;
    }
    //console.log(id + " " + [file, rank] + " clicked.");
    click_square(file, rank);
}

function toggle_orientation_onclick() {
    if (gui_orientation == "W")
	gui_orientation = "B";
    else
	gui_orientation = "W";
    gui_update();
}

// Test
new_game_onclick()
gui_mark_square(1, 1);

