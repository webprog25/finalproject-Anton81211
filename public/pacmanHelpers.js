// I called this class player to keep with the naming from tetris. It defines the pacman itself.
export class Player {
  // Constructs the player and spawns at the given x,y coordinates with the given radius as size for the pacman.
  constructor(x, y, radius = 10) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dir = { x: 0, y: 0 }; // Current movement direction, zero means no movement in the direction of the axis.
    this.nextDir = { x: 0, y: 0 };// Movement direction after player input via arrow keys.
    this.speed = 2; // Movement speed in pixels per frame (Felt like a good speed).
  }
  
  /* Sets the movement based on the input by the user. E.g.: (-1,0) means left, (0,-1) means up*/
  setDirection(dx, dy) {
    this.nextDir.x = dx;
    this.nextDir.y = dy;
  }
  
  /* This function checks if a move would hit a wall.*/
  collides(dir, map) {
    if (dir.x === 0 && dir.y === 0) return false; // No movement = we cannot hit anything
    /* We can calculate our nextX and Y by adding to our current position the inputted movement position times our predefined speed.*/
    const nextX = this.x + dir.x * this.speed; 
    const nextY = this.y + dir.y * this.speed;
    //Predicts the col and row our next move would put us in
    const col = Math.floor(nextX / map.cellSize);
    const row = Math.floor(nextY / map.cellSize);

    if (row < 0 || row >= map.grid.length) return true; // If we end outside the boundries of the map we also collide
    if (col < 0 || col >= map.grid[0].length) return true; // If we end outside the boundries of the map we also collide
    if (map.grid[row][col] === 1) return true; // If we hit a wall, we obviously collided with something.
    return false;
  }

  // The update function is called on every frame.
  update(map) {
    // Checks if the direction the player wants to move in causes a collision, if not: Then update the current movement direction.
    if (!this.collides(this.nextDir, map)) {
      this.dir = { ...this.nextDir }; // I use the spread operator to copy the x and y values without keeping a reference to the object
    }

    // This is the part were we actually try to move
    if (!this.collides(this.dir, map)) {
      this.x += this.dir.x * this.speed;
      this.y += this.dir.y * this.speed;
      return true;
    }
    return false; // Collision!
  }

  draw(ctx) {
    /* In this game the standard pacman starts by always facing right*/
    /* Circles on the canvas are drawn at a specified x,y coordinate with a specified radius.
    Also, the start and the end point for the circle have to be given in radians. Therefore, we have to convert from
    degrees to radians (Because I usually only work with degrees). Usually the formula for this is: degrees * pi/180 (I had enough math courses to know this by heart).
    But in our case, we can define pacman's mouth to be a quarter of a circle large. So, it's 90 degrees which can be further split up into two 45 degrees part. This is 1/8 of a circle.
    Now, for radians the conversion for 360 degrees is 2*pi. Hence, by our logic the conversion for 45 degrees would be (2*1/8)*pi = 0.25*pi. That means by multiplying by
    0.25 intervals we can make 45 degree jumps on the circle.*/
    let start = 0.25 * Math.PI; // Start drawing the circle at 45 degrees
    let end = 1.75 * Math.PI; // End the circle at 315 degrees

    if (this.dir.x === -1) { start = 1.25 * Math.PI; end = 0.75 * Math.PI; } // Facing to the left, we start drawing the circle at 225 degrees and end at 135 degrees
    if (this.dir.y === -1) { start = 1.75 * Math.PI; end = 1.25 * Math.PI; } // Usually, arc starts from the positive x axis increasing counter-clockwise, in this case the mouth would be facing down ward with start 315 degrees and end 225 degrees, but moving up and down "flips" the circle. So the mouth is pointing upward. 
    if (this.dir.y === 1) { start = 0.75 * Math.PI; end = 0.25 * Math.PI; } // Start at 135 degrees, end at 45 degrees. Same logic as for moving up.

    ctx.beginPath(); // This starts a new drawing path (meaning we start drawing a new 2d object and remove the old one).
    ctx.moveTo(this.x, this.y); // Move the pen to the center of pacman's position.
    ctx.arc(this.x, this.y, this.radius, start, end, false); // Draw the circle.
    ctx.fillStyle = '#FFD700'; // Common hex code for gold
    ctx.fill();
  }
}

//Pacman game instance
export class Game {
  constructor(canvas, hud) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = 20; // Each grid square is 20 by 20 pixels large
    this.map = this.createMap();
    // To place the pacman in the middle of a grid square we use the cellsize times 1.5 (Starting position is col = 1 and row = 1)
    this.startX = this.cellSize * 1.5;
    this.startY = this.cellSize * 1.5;
    // With cellsize*0.45 pacman has a radius of 9 pixels (slightly smaller than half the cell), this leaves a one pixel gap around pacman.
    this.player = new Player(this.startX, this.startY, this.cellSize * 0.45);
    this.hud = hud;
    this.score = 0;
    this.lives = 3; // Starting lives
    this.running = false;
    this.lastTime = 0;
    this.bindKeys();
  }

  createMap() {
    var rows = 16, cols = 16;
    var grid = [];
    for (var r = 0; r < rows; r++) {
      var row = [];
      for (var c = 0; c < cols; c++) {
        row.push(0); // Fill everything with dots
      }
      grid.push(row);
    }

    //Starting position is empty
    grid[1][1] = -1

    // Draw the borders
    for (var c = 0; c < cols; c++) { 
      grid[0][c] = 1;              // top row
      grid[rows - 1][c] = 1;       // bottom row
    }

    for (var r = 0; r < rows; r++) { 
      grid[r][0] = 1;              // left column
      grid[r][cols - 1] = 1;       // right column
    }

    // Inner walls
    for (var c = 3; c < cols - 3; c++) { 
      grid[4][c] = 1;              // top inner bars
      grid[5][c] = 1
      grid[10][c] = 1;             // bottom inner bars
      grid[11][c] = 1;
    }

    return { grid: grid, cellSize: this.cellSize };
  }


  bindKeys() {
    document.addEventListener('keydown', e => {
      if (!this.running) return;
      if (e.key === 'ArrowLeft') this.player.setDirection(-1, 0);
      if (e.key === 'ArrowRight') this.player.setDirection(1, 0);
      if (e.key === 'ArrowUp') this.player.setDirection(0, -1);
      if (e.key === 'ArrowDown') this.player.setDirection(0, 1);
    });
  }

  start() {
    if (this.running) return; // Prevent multiple starts
    this.map = this.createMap();
    this.respawn(); // Spawn the player
    this.score = 0;
    this.lives = 3;
    this.updateHUD(); // Write score and lives
    this.running = true;
    this.lastTime = 0;
    requestAnimationFrame(this.loop.bind(this));
  }

  // Main game loop runs 60 times per second
  loop(timestamp) {
    if (!this.running) return;
    this.lastTime = timestamp; // Store the current time for the next frame

    // Move the player
    const moved = this.player.update(this.map);
    // If the player couldn't move because they hit a wall or went out of bounds, remove a live.
    if (!moved) {
      this.lives--;
      this.updateHUD();
      if (this.lives <= 0) { // If lives hit 0, it'S game over.
        this.gameOver("Game Over!");
        return;
      }
      this.respawn(); // Respawn after lost live
    }

    // Convert player position to row and column index
    const pr = Math.floor(this.player.y / this.cellSize);
    const pc = Math.floor(this.player.x / this.cellSize);
    // Check if the row exists (lazy eval) and if it does check if the current position contains a dot. 
    if (this.map.grid[pr] && this.map.grid[pr][pc] === 0) {
      this.map.grid[pr][pc] = -1; // set to empty
      this.score += 10;
      this.updateHUD();
    }

    // Win condition
    if (this.allDotsCollected()) {
      this.gameOver("You Win!");
      return;
    }

    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  // Respawns the player at the top left corner.
  respawn() {
    this.player.x = this.startX;
    this.player.y = this.startY;
    this.player.dir = { x: 0, y: 0 };
    this.player.nextDir = { x: 0, y: 0 };
  }

  // Simple nested for loop that checks if no cell contains a dot.
  allDotsCollected() {
    for (let r = 0; r < this.map.grid.length; r++) {
      for (let c = 0; c < this.map.grid[r].length; c++) {
        if (this.map.grid[r][c] === 0) return false;
      }
    }
    return true;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Erase the entire canvas

    // For every cell on the grid: 
    for (let r = 0; r < this.map.grid.length; r++) {
      for (let c = 0; c < this.map.grid[r].length; c++) {
        const cell = this.map.grid[r][c]; // Get the value of the cell
        const x = c * this.cellSize, y = r * this.cellSize; // Calculate the cells x and y coordinates
        // If wall:
        if (cell === 1) {
          ctx.fillStyle = '#222222ff'; // Fill cell with wall color
          ctx.fillRect(x, y, this.cellSize, this.cellSize);
          ctx.strokeStyle = '#444444ff'; // Color the border for the wall in a slighly lighter gray.
          ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        } else if (cell === 0) { // If dot:
          ctx.beginPath(); // Draw new 2d object
          ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, 3, 0, Math.PI * 2); // in the middle of the cell with radius 3, starting from 0 degree to 360.
          ctx.fillStyle = '#eeeeeeff'; // A very light gray
          ctx.fill();
        }
      }
    }

    this.player.draw(ctx); // Draw the player
  }

  // Update lives and score on change
  updateHUD() {
    if (this.hud.score) this.hud.score.innerText = "Score: " + this.score;
    if (this.hud.lives) this.hud.lives.innerText = "Lives: " + this.lives;
  }

  // Displays the final game over message (you either win or loose), and calls the post function.
  gameOver(message) {
    this.running = false;
    this.updateHUD();
    alert(message + " Final Score: " + this.score);
    this.postScore();
  }

  // Function for submitting score data to the backend
  async postScore() {
    try {
      let name = prompt("Enter your name:", "AAA");
      if (!name) return;
      name = name.toUpperCase().substring(0, 3); // Ensure first three letters and upper case.
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, score: this.score, game: "pacman" })
      });
    } catch (e) {
      console.warn("Failed to post score", e);
    }
  }
}