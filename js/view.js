import * as Util from './util.js';


var svg_ns = "http://www.w3.org/2000/svg"
var board_svg;

var position = Util.make_8x8_null_array();
var orientation = "W";
var listener = null;


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
}

Velocity.defaults.fpsLimit = 30; // Default is 60. It must be factors of 60.

// This removes the piece at the destination square, if exists.
function move_piece(piece, x, y, remove=true) {
    var old_piece = position[x][y];
    if (remove) {
	if (old_piece != null) {
	    remove_piece(x, y);
	}
    }
    var square_size = 100;
    var [board_x, board_y] = board_coordinates(x, y);
    Velocity(piece, {x: board_x * square_size,
		     y: (7 - board_y) * square_size},
	     {duration: 400
	      // ,complete: function(elements, activeCall) {
	      // 	  piece.style.setProperty("left", "calc(" + board_x + " * var(--square-size))");
	      // 	  piece.style.setProperty("top", "calc((7 - " + board_y + ") * var(--square-size))");
	      // }
	     });
    
    position[x][y] = piece;
}

// If piece does not exist don't do anything. 
function remove_piece(x, y) {
    piece = position[x][y];
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

// TODO: Do marking more efficiently.
// Square elements can be kept after creation to avoid fething every time.
function get_square_element(x, y) {
    [x, y] = board_coordinates(x, y);
    var id = Util.position_index_to_name(x, y);
    var square = document.getElementById(id);
    return square;
}

function mark_square(x, y) {
    var square = get_square_element(x, y);
    square.classList.add("marked");
}

function unmark_square(x, y) {
    var square = get_square_element(x, y);
    square.classList.remove("marked");
}

function is_square_marked(x, y) {
    var square = get_square_element(x, y);
    return square.classList.contains("marked");
}

function update_gui() {
    // Update piece positions
    for (var i=0; i<8; i++) {
	for (var j=0; j<8; j++) {
	    if (position[i][j] != null) {
		var piece = position[i][j];
		move_piece(piece, i, j, false);
	    }
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
    mark_square,
    is_square_marked,
    unmark_square,
    new_game_onclick,
    square_onclick,
    toggle_orientation_onclick
};


