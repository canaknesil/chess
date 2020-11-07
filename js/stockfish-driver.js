

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
		msg_obj[c2] = msg.split(); msg = "";
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
	console.warn("Option parsing not implemented.");
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


// function sleep() {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }


// class Queue {
//     constructor() { this.list = []; }
//     push(item) {
// 	this.list.push(item);
//     }
//     async async_pop(func) {
// 	while (this.length() == 0)
// 	    await sleep(300);
// 	return func(this.list.shift(item));
//     }
//     length() { return this.list.length; }
//     empty() { return this.list.length == 0; }
// }



class Stockfish {
    // get_expected_command(cmd) {
    // 	var msg = this.queue.pop();
    // 	console.log(msg);
    // 	if (msg.command == cmd)
    // 	    return msg;
    // 	else
    // 	    // Ignore this message.
    // 	    return null;
    // }
    post(msg) {
	this.engine.postMessage(msg);
    }
    constructor() {
	//this.queue = new Queue();
	this.engine = new Worker("/js/stockfish.asm.js");

	//var q = this.queue;
	this.engine.onmessage = function onmessage(event) {
	    var msg_obj = sfd_parse_message(event.data);
	    if (msg_obj != null) {
		//q.push(msg_obj);
		console.log(msg_obj);
	    }
	};

	// INITIALIZATION
	// If possible initialization should be performed once. New games should be started via ucinewgame command.
	
	this.post("uci");
	// get id
	//var msg = this.get_expected_command("id");
	//console.log(msg);
	// get options (if any)
	// get uciok (required)
	
	// set options
	this.post("setoption name MultiPV value 3");
	
	this.post("isready"); // required before duing any caoculation to make sure initialization is finished.
	// get readyok
	
	
	// GAME INITIALIZATION
	// For position jumps within game, don't perform game initialization.
	// Perform game initialization to start a new game with the same engine. The old game will not be available (?).
	// For multiple concurrent games, start new engine instance. 
	
	this.post("ucinewgame");
	this.post("isready"); // required
	// get readyok
	
    }
}


// var stockfish = new Worker("/js/stockfish.asm.js");

// stockfish.onmessage = function onmessage(event) {
//     var msg_obj = sfd_parse_message(event.data);
//     if (msg_obj != null) {
// 	console.log(msg_obj);
//     }
//     // Use a producer consumer queue. Consuming commands should be handled syncronously.
// };



// // INITIALIZATION
// // If possible initialization should be performed once. New games should be started via ucinewgame command.

// stockfish.postMessage("uci");
// // get id
// // get options (if any)
// // get uciok (required)

// // set options
// stockfish.postMessage("setoption name MultiPV value 3");

// stockfish.postMessage("isready"); // required before duing any caoculation to make sure initialization is finished.
// // get readyok


// // GAME INITIALIZATION
// // For position jumps within game, don't perform game initialization.
// // Perform game initialization to start a new game with the same engine. The old game will not be available (?).
// // For multiple concurrent games, start new engine instance. 

// stockfish.postMessage("ucinewgame");
// stockfish.postMessage("isready"); // required
// // get readyok
// // position [fen <fenstring> | startpos ]  moves <move1> .... <movei>


// // ANALYTICS
// // position
// // go
// // stop
// // ponderhit (Send this if the user played the move that the engine is pondering on. The engine will continue the search in normal mode. This replaces the position command for a single move (?).)
// stockfish.postMessage("go depth 4");


// // QUIT

// // quit


// ADDITIONAL OPTIONS
// Use MultiPV option for multi-best line or k-best line mode.
// Use UCI_LimitStrength to limit the strenth when playing against humans.


export {
    Stockfish
};
