import * as View from "./view.js";
import * as Sfd from "./stockfish-driver.js";

View.new_game_onclick()
//View.mark_square(1, 1);

var engine = new Sfd.Stockfish("User analyzer");
var pc = engine.init();
pc.then(() => engine.quit());
