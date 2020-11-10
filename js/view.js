import * as Util from './util.js';


var svg_ns = "http://www.w3.org/2000/svg"
var board_svg;

var position = Util.make_8x8_null_array(); // Contains piece elements
var squares = Util.make_8x8_null_array(); // Constinas square elements
var markings = Util.make_8x8_null_array(false);
var orientation = "W";
var listener = null; // Set by controller.


// Draw chessboard
(function() {
    var board = document.getElementById("board");
    board_svg = document.createElementNS(svg_ns, "svg");
    
    board_svg.setAttribute("viewBox", "0 0 800 800");
    board_svg.setAttribute("id", "chessboard-svg");
    
    for (var x=0; x<8; x++) {
	for (var y=0; y<8; y++) {
	    var square = document.createElementNS(svg_ns, "rect");
	    squares[x][7 - y] = square;
	    
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

	    square.addEventListener("click", function() {square_onclick(this.id);});
	    
	    board_svg.appendChild(square);
	}
    }
    
    board.appendChild(board_svg);
})();


function board_coordinates(x, y) {
    return (orientation == "W" ? [x, y] : [7 - x, 7 - y])
}


function new_piece(piece_type, x, y) {
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
    move_piece(img, x, y);
    position[x][y] = img;
}


function perform_move(from, to, remove=true) {
    var piece = position[from[0]][from[1]];
    move_piece(piece, ...to, remove);
    position[to[0]][to[1]] = piece;
    position[from[0]][from[1]] = null;
}


Velocity.defaults.fpsLimit = 30; // Default is 60. It must be factors of 60.

function move_piece(piece, x, y, remove=true) {
    if (remove) {
	var old_piece = position[x][y];
	if (old_piece != null) {
	    remove_piece(x, y);
	}
    }
    
    var [board_x, board_y] = board_coordinates(x, y);
    var square_size = 100;
    var animation = true;
    if (animation) {
	Velocity(piece, {x: board_x * square_size,
			 y: (7 - board_y) * square_size},
		 {duration: 400
		  // ,complete: function(elements, activeCall) {
		  //     piece.setAttribute("x", board_x * square_size);
		  //     piece.setAttribute("y", (7 - board_y) * square_size);
		  // }
		 });
    } else {
	piece.setAttribute("x", board_x * square_size);
	piece.setAttribute("y", (7 - board_y) * square_size);
    }
}


// If piece does not exist don't do anything. 
function remove_piece(x, y) {
    var piece = position[x][y];
    if (piece != null) {
	piece.remove();
	position[x][y] = null;
    }
}

function update_from_position(new_position) {
    console.log("update_from_position");
    console.log(Util.position_to_string(new_position));

    for (var i=0; i<8; i++) {
	for (var j=0; j<8; j++) {
	    var square_name = Util.position_index_to_name(i, j);
	    var piece_type = Util.position_get_piece_by_index(new_position, i, j);
	    var gui_piece = position[i][j];
	    var gui_piece_type = (gui_piece == null ? null : gui_piece.getAttribute("piece_type"));
	    if (gui_piece_type != piece_type) {
		new_piece(piece_type, i, j);
	    }
	}
    }
}


function get_square_element(x, y) {
    [x, y] = board_coordinates(x, y);
    return squares[x][y];
}

function mark_square(x, y) {
    var square = get_square_element(x, y);
    square.classList.add("marked");
    markings[x][y] = true;
}

function unmark_square(x, y) {
    var square = get_square_element(x, y);
    square.classList.remove("marked");
    markings[x][y] = false;
}

function is_square_marked(x, y) {
    var square = get_square_element(x, y);
    var is_marked_square = square.classList.contains("marked");
    var is_marked_store = markings[x][y];
    console.assert(is_marked_square == is_marked_store);
    return is_marked_store;
}

function update_gui() {
    for (var i=0; i<8; i++) {
	for (var j=0; j<8; j++) {
	    // Update piece positions
	    if (position[i][j] != null) {
		var piece = position[i][j];
		move_piece(piece, i, j, false);
	    }
	    // Update markings
	    if (markings[i][j])
		mark_square(i, j);
	    else
		unmark_square(i, j);
	}
    }
}


// Input from user

function new_game_onclick() {
    listener.new_game_onclick();
}

function square_onclick(id) {
    var [file, rank] = Util.position_name_to_index(id);
    [file, rank] = board_coordinates(file, rank);
    listener.square_onclick(file, rank);
}

function toggle_orientation_onclick() {
    if (orientation == "W")
	orientation = "B";
    else
	orientation = "W";
    update_gui();
}


// Register listener
function add_listener(new_listener) {
    listener = new_listener;
}


export {
    add_listener,
    update_from_position,
    perform_move,
    mark_square,
    is_square_marked,
    unmark_square,
    new_game_onclick,
    square_onclick,
    toggle_orientation_onclick
};


