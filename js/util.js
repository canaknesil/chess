function make_8x8_null_array(fill=null) {
    return [[fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill],
	    [fill, fill, fill, fill, fill, fill, fill, fill]];
}


function array_equal(a1, a2) {
    if (a1.length != a2.length)
	return false;
    for (var i=0; i<a1.length; i++) {
	if (a1[i] != a2[i])
	    return false;
    }
    return true;
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
	    var piece = position[j][i];
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


function position_move_to_index(move) {
    var from = move.substr(0, 2);
    var to = move.substr(2, 4);
    from = position_name_to_index(from);
    to = position_name_to_index(to);
    return [from, to];
}




export {
    array_equal,
    make_8x8_null_array,
    make_empty_position,
    make_start_position,
    position_to_string,
    position_get_piece_by_index,
    position_get_piece_by_name,
    position_index_to_name,
    position_name_to_index,
    position_move_to_index
};

console.log("UTIL LOADED.");
