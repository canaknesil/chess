import * as View from "./view.js";
import * as Sfd from "./stockfish-driver.js";

View.new_game_onclick()
//View.mark_square(1, 1);

var engine = new Sfd.Stockfish("User analyzer");
var pc = engine.init();
pc = pc.then(() => engine.set_start_position());

pc = pc.then(() => engine.perform_analysis());

pc = pc.then((bestmove) => {
    console.log("BESTMOVE: " + bestmove);
});

pc = pc.then(() => engine.quit());

