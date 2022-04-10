const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// let user_words = {};

// Load words
const fs = require("fs");
let words = [];
fs.readFile("5wle.csv", "utf-8", (err, data) => {
    if (err) throw err;
    words = data.split("\n");
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    // Pick a word
    let socket_word = words[Math.floor(Math.random()*words.length)];
    console.log('A user connected. Their word is ' + socket_word);
    
    socket.on('evaluate', (guessed_word) => {
        console.log('User want to evaluate: ' + guessed_word);
        socket.emit("evaluate", JSON.stringify(evaluate(socket_word.toUpperCase(), guessed_word)));
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
});


/**
 * Evaluates your guessed_word against the word which the server picked for you
 * @param {String} word // Server's pick for you
 * @param {String} guess // Your guess
 * @retuns // List representing what characters are where
 */
function evaluate(word, guess) {
    let response = {status:0, eval:[]}

    // Input checking
    if (typeof(guess) != "string") {response.status=1;}
    if (guess.length != 5) {response.status=1;}
    if (words.indexOf(guess) == -1) {response.status=1;}
    if (response.status) {return response;}
    
    // Prepare inputs
    let word_letters = word.split("")
    let guess_letters = guess.split("")
    let eval = [0,0,0,0,0];

    // 1st pass for full match
    for (let i = 0; i < 5; i++) {
        if (word_letters[i] == guess_letters[i]) {
            eval[i] = 2;
            word_letters[i] = null;
        }
    }
    
    // 2nd pass for partial match
    for (let i = 0; i < 5; i++) {
        if (word_letters.indexOf(guess_letters[i]) > -1) {
            eval[i] = 1;
            word_letters[word_letters.indexOf(guess_letters[i])] = null;
        }
    }
    
    response.eval = eval;
    return response;
}


server.listen(3000, () => {
    console.log('listening on *:3000');
});