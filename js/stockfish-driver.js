

// Returning null means command should be ignored. It is not an error.
function sfd_parse_message(msg) {
    function car(str) {
	if (str.indexOf(" ") == -1) // single word
	    return str;
	else
	    return str.substr(0,str.indexOf(' '));
    }
    function cdr(str) {
	if (str.indexOf(" ") == -1)
	    return "";
	else
	    return str.substr(str.indexOf(' ')+1);
    }

    if (msg.length == 0)
	return null;

    var command = car(msg);
    var msg_obj = {command: command};
    var original_msg = msg;
    msg = cdr(msg);

    function parsing_error(error_msg = "") {
	console.warn("Parsing error (" + error_msg + "): " + original_msg);
	return null;
    }

    if (command == "id") {
	var attr = car(msg);
	if (attr == "name" || attr == "author") {
	    msg_obj[attr] = cdr(msg); msg = "";
	} else
	    return parsing_error();
    } else if (command == "uciok" || command == "readyok") {
	// single word msg
    } else if (command == "bestmove") {
	msg_obj["bestmove"] = car(msg); msg = cdr(msg);
	if (msg != "") {
	    var word = car(msg); msg = cdr(msg);
	    if (word == "ponder") {
		msg_obj["ponder"] = car(msg); msg = cdr(msg);
	    } else
		return parsing_error();
	}
    } else if (command == "copyprotection" || command == "registration") {
	var status = car(msg); msg = cdr(msg);
	if (status == "ok" || status == "error" || status == "checking")
	    msg_obj["status"] = status;
	else
	    return parsing_error();
    } else if (command == "info") {
	while (msg != "") {
	    var c2 = car(msg); msg = cdr(msg);
	    if (c2 == "depth" ||
		c2 == "seldepth" ||
		c2 == "time" ||
		c2 == "nodes" ||
		c2 == "multipv" ||
		c2 == "currmove" ||
		c2 == "currmovenumber" ||
		c2 == "hashfull" ||
		c2 == "nps" ||
		c2 == "tbhits" ||
		c2 == "sbhits" ||
		c2 == "cpuload") {
		msg_obj[c2] = car(msg); msg = cdr(msg);
	    } else if (c2 == "pv" || c2 == "refutation") {
		var idx = msg.indexOf("bmc");
		if (idx != -1) {
		    var bmc_msg = msg.substr(idx);
		    if (car(bmc_msg) == "bmc") {
			msg_obj["bmc"] = cdr(bmc_msg);
		    }
		    msg = msg.substr(0, idx - 1);
		}
		msg_obj[c2] = msg.split(" "); msg = "";
	    } else if (c2 == "score") {
		var c3 = car(msg); msg = cdr(msg);
		if (c3 == "cp" || c3 == "mate") {
		    msg_obj[c3] = car(msg); msg = cdr(msg);
		} else if (c3 == "lowerbound" || c3 == "upperbound") {
		    msg_obj[c3] = true;
		} else
		    return parsing_error();
	    } else if (c2 == "string") {
		msg_obj[c2] = msg;
	    } else if (c2 == "currline") {
		if (msg[0] >= '0' && msg[0] <= '9') {
		    msg_obj["cpunr"] = car(msg); msg = cdr(msg);
		}
		msg_obj[c2] = msg.split(); msg = "";
	    } else
		return parsing_error("c2: " + c2);
	}
    } else if (command == "option") {
	msg_obj["option_str"] = original_msg; msg = ""
	//console.warn("Option parsing not implemented.");
    } else if (command == "Stockfish.js") {
	// This is the start message. Ignore it.
	return null;
    } else {
	console.warn("Unknown UCI command: " + original_msg);
	return null;
    }

    if (msg.length != 0) {
	console.warn("Part of the command \"" + command + "\" is not parsed: " + msg);
    }
    
    return msg_obj;
}



class Stockfish {

    post_with_cb(msg, end_command, cb) {
	console.log("SFD POST (" + this.engine_id + "): " + msg + "");

	if (end_command) {
	    this.post_queue.push({end_command: end_command,
				  cb: cb});
	} else {
	    cb();
	}

	this.engine.postMessage(msg);
    }


    post(msg, end_command) {
	var this_obj = this;
	return new Promise(function(resolve, reject) {
	    this_obj.post_with_cb(msg, end_command, resolve);
	});
    }

    
    constructor(engine_id, update_info_cb, number_of_lines=1, elo=null) {
	this.engine_id = engine_id;
	this.update_info_cb = update_info_cb;
	this.number_of_lines = number_of_lines;
	this.elo = elo;

	this.engine = new Worker("/js/stockfish.asm.js");
	this.post_queue = []; // push expected response in post, pop in on message.

	var this_obj = this;

	this.msg_queue = []; // will be used in onmessage to store messages.
	this.engine.onmessage = function onmessage(event) {
	    console.log("SFD (" + this_obj.engine_id + "): " + event.data);
	    var msg_obj = sfd_parse_message(event.data);
	    if (msg_obj != null) {
		this_obj.msg_queue.push(msg_obj);
		var post_obj = this_obj.post_queue[0];
		
		if (post_obj.end_command == "bestmove" && msg_obj.command == "info" && this_obj.update_info_cb) {
		    this_obj.update_info_cb(msg_obj);
		}

		if (post_obj.end_command == msg_obj.command) {
		    this_obj.post_queue.shift();
		    var messages = this_obj.msg_queue;
		    this_obj.msg_queue = [];
		    post_obj.cb(messages);
		}
	    } else {
		console.log("Ignoring message.");
	    }
	};
    }
    
    
    init() {
	var this_obj = this;

	// INITIALIZATION
	// If possible initialization should be performed once. New games should be started via ucinewgame command.

	// post uci
	// get id
	// get options (if any)
	// get uciok (required)

	var pc = this.post("uci", "uciok").then(function handle_msg_uci(messages) {
	    console.log("handle_msg_uci");

	    for (var i=0; i<messages.length; i++) {
		var msg = messages[i];
		if (msg.command == "id") {
		    if (msg.name)
			this_obj.name = msg.name;
		    if (msg.author)
			this_obj.author = msg.author;
		} else if (msg.command == "option") {
		    // Ignore options right now.
		} else if (msg.command == "uciok") {
		    
		} else {
		    console.warn("Unexpected message: ");
		    console.log(msg);
		}
	    }
	});
	
	// set options
	// post isready (required before duing any caoculation to make sure initialization is finished)
	// get readyok

	if (this.number_of_lines > 1)
	    pc = pc.then(() => this.post("setoption name MultiPV value " + this_obj.number_of_lines));
	if (this.elo) {
	    console.warn("UCI_Elo not implemented");
	    // pc = pc.then(() => {
	    // 	this.post("setoption name UCI_LimitStrength value true");
	    // 	this.post("setoption name UCI_Elo value " + this_obj.elo);
	    // });
	}
	
	pc = pc.then(() => this.post("isready", "readyok"));
	pc = pc.then(function(messages) {
	    console.assert(messages.length == 1);
	    console.log("handle_isready");
	});

	
	// GAME INITIALIZATION
	// For position jumps within game, don't perform game initialization.
	// Perform game initialization to start a new game with the same engine. The old game will not be available (?).
	// For multiple concurrent games, start new engine instance. 
	
	// post ucinewgame
	// post isready (required)
	// get readyok

	pc = pc.then(() => this.post("ucinewgame"));
	pc = pc.then(() => this.post("isready", "readyok").then(function(messages) {
	    console.assert(messages.length == 1);
	    console.log("handle_isready");
	}));

	return pc;
    }


    quit() {
	return this.post("quit");
    }


    set_position(position) {
	// TODO
    }


    set_start_position() {
	return this.post("position startpos");
    }
    

    perform_moves(moves) {
	// TODO
	//return this.post("position moves " + moves);
    }


    set_position_with_fen(fen) {
	return this.post("position fen " + fen);
    }
    

    perform_analysis(depth=10) {
	var this_obj = this;
	return this.post("go depth " + depth, "bestmove").then(function(messages) {
	    var len = messages.length;
	    //console.log(messages);
	    //console.log(this_obj.number_of_lines + 1);
	    console.assert(len >= this_obj.number_of_lines + 1);
	    var info_msgs = messages.slice(len - 1 - this_obj.number_of_lines, len - 1);
	    var bestmove_msg = messages[len-1];
	    for (var i=0; i<info_msgs.length; i++)
		console.assert(info_msgs[i].command == "info");
	    console.assert(bestmove_msg.command == "bestmove");

	    this_obj.bestmove = bestmove_msg.bestmove;
	    if (bestmove_msg.ponder) {
		this_obj.ponder = bestmove_msg.ponder;
	    }
	    return info_msgs;
	});
    }
    
}




// // ANALYTICS
// // position
// // go
// // stop
// // ponderhit (Send this if the user played the move that the engine is pondering on. The engine will continue the search in normal mode. This replaces the position command for a single move (?).)
// stockfish.postMessage("go depth 4");



// ADDITIONAL OPTIONS
// Use MultiPV option for multi-best line or k-best line mode.
// Use UCI_LimitStrength to limit the strenth when playing against humans.


export {
    Stockfish
};
