import { Tetris } from "./tetrisHelpers.js";

const canvas = document.getElementById("tetris");
const hud = {
  score: document.getElementById("score"),
};
const startBtn = document.getElementById("start");

const game = new Tetris(canvas, hud);

startBtn.addEventListener("click", () => {
  game.start();
});
