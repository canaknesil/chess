

function sfd_parse_message(msg) {
    tokens = msg.split(" ");
    return tokens;
}



var stockfish = new Worker("/js/stockfish.asm.js");

stockfish.onmessage = function onmessage(event) {
    console.log(sfd_parse_message(event.data));
};

stockfish.postMessage("go depth 5");
