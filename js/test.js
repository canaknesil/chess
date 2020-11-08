import * as View from "./view.js";
import * as Sfd from "./stockfish-driver.js";

View.new_game_onclick()
//View.mark_square(1, 1);


// STOCKFISH DRIVER USAGE

function update_info_cb(info) {
    console.log("INFO update");
    console.log(info);
}

var engine = new Sfd.Stockfish("User analyzer", update_info_cb);
var pc = engine.init();
var info_p = engine.info_promise;

pc = pc.then(() => engine.set_start_position());

pc = pc.then(() => engine.perform_analysis());

pc = pc.then((bestmove) => {
    console.log("BESTMOVE: " + bestmove);
});

pc = pc.then(() => engine.quit());

