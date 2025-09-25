import { Game } from './pacmanHelpers.js';

var canvas = document.getElementById('pacman');
var hud = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives')
};
var startBtn = document.getElementById('start');

var game = new Game(canvas, hud);

startBtn.addEventListener('click', function () {
  game.start();
});