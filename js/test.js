import * as View from "./view.js";


View.new_game_onclick()
//View.mark_square(1, 1);


// var chess = new Chess();
// console.log(chess.ascii());
// console.log(chess.moves({verbose: true}));
// chess.move({from: "e2", to: "e4"});
// console.log(chess.ascii());
// console.log(chess.moves({verbose: true}));



// STOCKFISH DRIVER USAGE

//import * as Sfd from "./stockfish-driver.js";

// function update_info_cb(info) {
//     console.log("INFO update");
//     //console.log(info);
// }

// var engine = new Sfd.Stockfish("User analyzer", update_info_cb, 3);
// var pc = engine.init();

// pc = pc.then(() => engine.set_start_position());

// pc = pc.then(() => engine.perform_analysis());

// function print_bestmove(info_msgs) {
//     for (var i=0; i<info_msgs.length; i++) {
// 	console.log("Line " + info_msgs[i].multipv + " cp " + info_msgs[i].cp + " bestmove " + info_msgs[i].pv);
//     }
//     console.log("Bestmove: " + info_msgs[0].pv[0]);
// }

// pc = pc.then(print_bestmove);

// pc = pc.then(() => engine.perform_moves("b1a3 e2e4 a3b1"));
// pc = pc.then(() => engine.perform_analysis());
// pc = pc.then(print_bestmove);

// pc = pc.then(() => engine.quit());

