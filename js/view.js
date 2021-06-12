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
    board_svg = $(document.createElementNS(svg_ns, "svg")).attr(
	{'viewBox': '0 0 800 800',
	 'id': 'chessboard-svg'}).appendTo('#board');

    for (var x=0; x<8; x++) {
	for (var y=0; y<8; y++) {
	    var file = String.fromCharCode(x + 'a'.charCodeAt());
	    var rank = String.fromCharCode(7 - y + '1'.charCodeAt());
	    var id = file + rank;
	    
	    var square = $(document.createElementNS(svg_ns, "rect"))
		.attr({'width': '100',
		       'height': '100',
		       'x': x * 100,
		       'y': y * 100,
		       'id': id})
		.appendTo(board_svg)
		.click(function() { square_onclick(this.id); });
	    
	    if ((x + y) % 2 != 0)
		square.addClass('square-dark');
	    else
		square.addClass('square-light');
	    
	    squares[x][7 - y] = square;
	}
    }    
})();


function set_orientation(new_orientation) {
    if (new_orientation == "W")
	orientation = "W";
    else if (new_orientation == "B")
	orientation = "B";
    else
	console.warn("Bad orientation value.");
    update_gui();
}


function board_coordinates(x, y) {
    return (orientation == "W" ? [x, y] : [7 - x, 7 - y])
}


function toggle_orientation() {
    if (orientation == "W")
	orientation = "B";
    else
	orientation = "W";
    update_gui();
}


function new_piece(piece_type, x, y) {
    var img = $(document.createElementNS(svg_ns, "image"))
	.attr({"href": "/images/pieces/classic/" + piece_type + ".svg",
	       'x': 4 * 100,
	       'y': 4 * 100,
	       'height': '100',
	       'width': '100',
	       'piece_type': piece_type,
	       'class': "piece " + piece_type})
	.appendTo(board_svg);

    move_piece(img, x, y, true, false);
    position[x][y] = img;
}


function perform_move(from, to, remove=true, post_animation_cb=null) {
    var piece = position[from[0]][from[1]];
    move_piece(piece, ...to, remove, true, post_animation_cb);
    position[to[0]][to[1]] = piece;
    position[from[0]][from[1]] = null;
}


$.Velocity.defaults.fpsLimit = 30; // Default is 60. It must be factors of 60.

function move_piece(piece, x, y, remove=true, animation=true, post_animation_cb=null) {
    var old_piece = position[x][y];
    var [board_x, board_y] = board_coordinates(x, y);
    var square_size = 100;

    var new_x = board_x * square_size;
    var new_y = (7 - board_y) * square_size;

    function post_func() {
	if (remove) {
	    if (old_piece != null) {
		$(old_piece).remove();
	    }
	}
	if (post_animation_cb)
	    post_animation_cb();
    }
    
    if (animation) {
	$(piece).velocity(
	    {x: new_x, y: new_y},
	    {duration: 400
	     ,complete: function(elements, activeCall) { post_func(); }
	    });
    } else {
	$(piece).attr({'x': new_x, 'y': new_y});
	post_func();
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
	    var gui_piece_type = (gui_piece == null ? null : gui_piece.attr("piece_type"));
	    if (gui_piece_type != piece_type) {
		if (piece_type == null)
		    remove_piece(i, j);
		else
		    new_piece(piece_type, i, j);
	    }
	}
    }
    update_gui();
}


function get_square_element(x, y) {
    [x, y] = board_coordinates(x, y);
    return squares[x][y];
}

function mark_square(x, y) {
    var square = get_square_element(x, y);
    square.addClass("marked");
    markings[x][y] = true;
}

function unmark_square(x, y) {
    var square = get_square_element(x, y);
    square.removeClass("marked");
    markings[x][y] = false;
}

function is_square_marked(x, y) {
    var square = get_square_element(x, y);
    var is_marked_square = square.hasClass("marked");
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
		move_piece(piece, i, j, false, false);
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

function get_radio_button_value(name) {
    var options = document.getElementsByName(name);
    var option = null;
    for (var i=0; i<options.length; i++) {
	if (options[i].checked) {
	    return options[i].value;
	}
    }
    return option;
}

function new_game_onclick() {
    var color = get_radio_button_value("new_game_color");
    if (color == "white")
	color = "W";
    else if (color == "black")
	color = "B";
    else if (color == null) {}
    else
	console.warn("Unrecognized color value.");
    
    var mode = get_radio_button_value("new_game_mode");
    if (mode == "user_vs_computer")
	mode = "user vs computer";
    else if (mode == "user_vs_user")
	mode = "user vs user";
    else
	console.warn("Unrecognized mode value.");

    var opponent_depth = parseInt(document.getElementById("new_game_opponent_depth").value);

    listener.new_game_onclick(color, mode, opponent_depth);
}

function square_onclick(id) {
    var [file, rank] = Util.position_name_to_index(id);
    [file, rank] = board_coordinates(file, rank);
    listener.square_onclick(file, rank);
}

function toggle_orientation_onclick() {
    toggle_orientation();
}

function back_onclick() {
    listener.back_onclick();
}

function forward_onclick() {
    listener.forward_onclick();
}


// Register listener
function add_listener(new_listener) {
    listener = new_listener;
}

// Add listeners to elements.
$('#new_game_button').click(new_game_onclick);
$('#toggle_orientation_button').click(toggle_orientation_onclick);
$('#game_flow_back_button').click(back_onclick);
$('#game_flow_forward_button').click(forward_onclick);


//
// Analysis
//

function update_score(score, line) {
    if (line == 0)
	document.getElementById("score").innerHTML = score;
}


export {
    add_listener,
    update_from_position,
    perform_move,
    mark_square,
    is_square_marked,
    unmark_square,
    set_orientation,
    new_game_onclick,
    square_onclick,
    toggle_orientation_onclick,
    back_onclick,
    forward_onclick,
    update_score
};


