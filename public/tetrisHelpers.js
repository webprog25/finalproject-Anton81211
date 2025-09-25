/*This is the board class. Basically, it's responsible for generating the game board. You could technically create one board class for both games. But,
I wanted to separate the helper classes for both games to show that they can be implement from scratch.*/
export class Board{
  /*This constructor just creates the board and fills it with zeroes. So we end up with a 2d array filled only with zeroes.*/ 
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = this.emptyBoard();
  }

  //This stays the same as in the previous version.
  emptyBoard() {
    const matrix = [];
    let h = this.height;
    while (h--) { // The while loop is repeated h-times (h is the height of the board)
      matrix.push(new Array(this.width).fill(0)); //add a row of width-many zeros
    }
    return matrix;
  }

  //This functions removes any line that is completely filled. So, all squares are filled with parts of Tetrominos
  clearLines() {
    const before = this.grid.length;
    const newGrid = [];

    //This for loop basically filters out all lines that are full. 
    for (let i = 0; i < this.grid.length; i++) {
      let row = this.grid[i];
      let hasZero = false;
      //If we find a row with a zero in it (an empty field), we jump out of the loop and add it to the new grid.
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 0) {
          hasZero = true;
          break;
        }
      }
      if (hasZero) {
        newGrid.push(row);
      }
    }
    this.grid = newGrid; //Change the current grid to the new grid

    const cleared = before - this.grid.length; //Calculate the number of cleared lines.

    //Add new empty rows at the top of the game board
    while (this.grid.length < this.height) {
      this.grid.unshift(new Array(this.width).fill(0));
    }

    return cleared;
  }
  /*Same as in the previous version, I just removed the arrow function and replaced the foreach with a nested for loop.
  I hope this makes it easier to understand.*/
  merge(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) { //If a cell is part of the piece (Tetromino)
          this.grid[y + piece.pos.y][x + piece.pos.x] = piece.shape[y][x]; //We lock it into place at the position where it could not move any further.
        }
      }
    }
  }

  //Remains the same: Checks if player piece collides with walls or blocks
  /*Essentially, for each row and column we check:
    1) Is the cell occupied?
    2.1) Row exists in arena
    2.2) Arena cell is not zero.
  */
  collides(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const row = this.grid[y + piece.pos.y];
          if (!row || row[x + piece.pos.x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

export class Tetris {
  constructor(canvas, hud) {
    this.canvas = canvas; //Same as before, I just moved the actual initialization to tetrisnew.js
    this.ctx = canvas.getContext("2d"); //Remains the same: We use the 2d drawing context, since our games are in 2d (and a collision check in 3D is a lot more difficult)
    this.hud = hud; // The hud is resposible for displaying the score

    // Tetromino shapes (That's the actual name for a Tetris piece (I did not know that): https://en.wikipedia.org/wiki/Tetromino)
    //Colors from the wiki page
    this.shapes = [
      { shape: [[1,1,1,1]],       color: "#0ff" }, // I - Cyan
      { shape: [[1,1],[1,1]],     color: "#ff0" }, // O - Yellow
      { shape: [[0,1,0],[1,1,1]], color: "#a0f" }, // T - Purple
      { shape: [[1,1,0],[0,1,1]], color: "#0f0" }, // S - Green
      { shape: [[0,1,1],[1,1,0]], color: "#f00" }, // Z - Red
      { shape: [[1,0,0],[1,1,1]], color: "#00f" }, // J - Blue
      { shape: [[0,0,1],[1,1,1]], color: "#fa0" }  // L - Orange
    ];

    this.running = false; //At the start the game is not running. Could be changed but that would be bad game design.
    this.bindKeys();
  }

  //Same as before: Spawns a new piece at the top of the game board.
  resetPiece() {
    const index = Math.floor(Math.random() * this.shapes.length); //Randomly select piece index
    const shapeInfo = this.shapes[index]; //Select the piece
    const shape = shapeInfo.shape;
    const color = shapeInfo.color
    this.piece = {
      shape: shape,
      color: color,
      pos: {
        x: Math.floor(this.board.width / 2) - Math.ceil(shape[0].length / 2), //Align horizontally on the board
        y: 0 //Vertically at the top of the board
      }
    };
  }

  //Logic remains the same: But this time I've decided to only use the arrow keys.
  /* Left and Right arrow move the piece to the left and right respectively
     The up arrow rotates the piece, and the down arrow makes the piece drop faster. */
  bindKeys() {
    document.addEventListener("keydown", e => {
      if (!this.running) return;
      if (e.key === "ArrowLeft") this.move(-1);
      if (e.key === "ArrowRight") this.move(1);
      if (e.key === "ArrowDown") this.drop();
      if (e.key === "ArrowUp") this.rotate();
    });
  }

  //This starts the game
  start() {
    this.board = new Board(10, 20); //Create the board with width 10 and height 20
    this.score = 0;
    this.resetPiece(); //Spawn first piece
    this.updateHUD();

    this.dropCounter = 0; //Keeps track of the time between the last drop and now
    this.dropInterval = 500; //ms between drops (1000 or 1 sec was too long)
    this.lastTime = 0; //We use this as a timer for the animation frames.

    this.running = true;
    requestAnimationFrame(this.loop.bind(this)); //We set this browser function to our game loop which gets called before each screen repaint (official term, it's essentially a screen refresh)
  }

  //Remains the same: Move the piece to the left or right (-1 or 1)
  move(dir) {
    this.piece.pos.x += dir;
    // If we hit a wall or block revert the move
    if (this.board.collides(this.piece)) {
      this.piece.pos.x -= dir;
    }
  }

  //Rotate clockwise (We don't support counter clockwise rotation (makes the game a bit more difficult ;-) )).
  rotate() {
    const oldShape = this.piece.shape; //We save the old shape in case we need to revert after an invalid rotate
    const rotated = [];
    //The same logic as with the original (based on matrix tranpose)
    for (let x = 0; x < oldShape[0].length; x++) {
      const newRow = [];
      for (let y = oldShape.length - 1; y >= 0; y--) {
        newRow.push(oldShape[y][x]);
      }
      rotated.push(newRow);
    }
    this.piece.shape = rotated;

    if (this.board.collides(this.piece)) {
      this.piece.shape = oldShape; //If we collide revert the rotation.
    }
  }

  //Moves the piece down by one on the y axis
  drop() {
    this.piece.pos.y++;
    if (this.board.collides(this.piece)) {
      this.piece.pos.y--; //If we collide move back one row
      this.board.merge(this.piece); //Lock the piece into place

      const lines = this.board.clearLines(); //How many lines did we clear?
      if (lines > 0) {
        this.score += lines * 100;
        this.updateHUD();
      }

      this.resetPiece(); //Spawn new piece
      
      //We check for a gameover (if the piece immediately collide with something)
      if (this.board.collides(this.piece)) {
        this.running = false;
        this.postScore();
        alert("Game Over! Press Start to play again.");
      }
    }
    this.dropCounter = 0; //Reset the time for the next drop
  }
  //Basic game loop
  /* I just want to mention it because it's important: This is in essence out game engine. It keeps track of the game time, moves pieces via drop after a predefined interval, and
  redraws the game for every frame. */
  loop(time = 0) {
    if (!this.running) return; //If game over then stop.

    const delta = time - this.lastTime; //This calculates the millisecond since the last frame. requestAnimationFrame provides the time variable
    this.lastTime = time;
    this.dropCounter += delta;
    
    //Every 500 ms the piece moves down one line automatically
    if (this.dropCounter > this.dropInterval) {
      this.drop();
    }

    this.draw();
    requestAnimationFrame(this.loop.bind(this)); //Repeat the loop
  }

  //This function handles the visuals.
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //We clear the canvas. Basically, we erase the previous frame.

    //We calculate the cell sizes. We need to do this because the board and the canvas use different units.
    const cellW = this.canvas.width / this.board.width; //Canvas width = 240 pixels, Board width = 10 Cells. So, 240/10 = 24 pixels per cell 
    const cellH = this.canvas.height / this.board.height; //400/20 = 20 pixels per cell

    //Draw the board by looping through the grid
    for (let y = 0; y < this.board.grid.length; y++) {
      for (let x = 0; x < this.board.grid[y].length; x++) {
        if (this.board.grid[y][x]) { //If a cell contains a part of a piece color it light blue.
          ctx.fillStyle = "#0bf"; //I was experimenting a bit with colors and light blue represented something frozen in place nicely.
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
      }
    }

    //Draw an active piece on the board by looping through it cells
    for (let y = 0; y < this.piece.shape.length; y++) {
      for (let x = 0; x < this.piece.shape[y].length; x++) {
        if (this.piece.shape[y][x]) { //If a cell is covered by the piece fill it with the piece's color.
          ctx.fillStyle = this.piece.color;
          ctx.fillRect(
            (x + this.piece.pos.x) * cellW,
            (y + this.piece.pos.y) * cellH,
            cellW, cellH
          );
        }
      }
    }
  }

  //Just updates the score.
  updateHUD() {
    if (this.hud.score) {
      this.hud.score.textContent = `Score: ${this.score}`;
    }
  }

  // Post the game score to the backend
  async postScore() {
    try {
      let name = prompt("Enter your name:", "AAA");
      if (!name) return; //If no name then cancel
      name = name.toUpperCase().substring(0, 3); //Make sure the name is only three chars long

      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          score: this.score,
          game: "tetris"
        }),
      });
    } catch (e) {
      console.warn("Failed to post score", e);
    }
  }
}