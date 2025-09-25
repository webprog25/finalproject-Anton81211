[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19513513&assignment_repo_type=AssignmentRepo)
Final Project
====================

Project Title: Online Arcade
Your Name: Anton Urbanek

Overview
--------
This project is a prototype for a game collection website. Simply put, the website collects a number of games and displays them as cards with a picture, a start button, and the ability to view high scores.
Each game is implemented via the HTML canvas element. Allowing players to play the game and store their highscore with a three letter, capitalized name on the score board for the game.

Running
-------
You only need npm install and npm start.

Do I need to load data from init_db.mongodb? No (I use Sqlite)

Features
--------
The list of implemented feature is rather long, I invite you to just play the games and read my comments. The comments mainly explain the rationale behind some of the features. Also, I invite you to check out the included design documents.

Collaboration and libraries
---------------------------
For Tetris I had a look at the following implementation, nothing was copied, but the general ideas behind the implementations helped me in creating my code:
https://levelup.gitconnected.com/build-a-tetris-game-with-html-canvas-css-and-javascript-on-autocode-132c8346e60c
https://medium.com/swlh/building-tetris-in-js-the-rotation-problem-and-asynchronous-functions-3a7c42dcac8d
https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1
https://web.itu.edu.tr/~msilgu/tetris/tetris.html

Same holds for Pacman:
https://github.com/bward2/pacman-js
https://github.com/kubowania/pac-man
https://codepen.io/hellokatili/pen/xwKRmo
https://www.youtube.com/watch?v=Tk48dQCdQ3E 

Also, I added the following to the package.json:
"sqlite3": "^5.1.7",
"sqlite": "^5.1.1",
The version numbers are from here: https://www.npmjs.com/package/sqlite3 and https://www.npmjs.com/package/sqlite

For the design documents I used:
https://xournalpp.github.io/ for the map
https://balsamiq.com/ for the wireframes