//Old version reworked!!!
const canvas = document.getElementById('tetris'); // Here we reference the HTML canvas (I might change the name later on)
const context = canvas.getContext('2d'); // We use the 2d drawing context, since our games are in 2d (and a collision check in 3D is a lot more difficult)
context.scale(20, 20); // each block is 20x20px

// Create a 2d and fill it with zeros
function createMatrix(w, h) {
  const matrix = [];
  while (h--) { // The while loop is repeated h-times (h is the height of the board)
    matrix.push(new Array(w).fill(0)); //add a row of w-many zeros
  }
  return matrix;
}

// Tetromino shapes (That's the actual name for a Tetris piece (I did not know that): https://en.wikipedia.org/wiki/Tetromino)
const pieces = {
  'I': [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  'J': [[2,0,0],[2,2,2],[0,0,0]],
  'L': [[0,0,3],[3,3,3],[0,0,0]],
  'O': [[4,4],[4,4]], //Square
  'S': [[0,5,5],[5,5,0],[0,0,0]],
  'T': [[0,6,0],[6,6,6],[0,0,0]],
  'Z': [[7,7,0],[0,7,7],[0,0,0]]
};

// Return a copy of the requested piece
function createPiece(type) {
  return pieces[type];
}

// Draw every non-zero cell of a matrix at an offset
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) { // only draw if cell is not empty
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// Clear screen, then draw arena and player piece
function draw() {
  context.fillStyle = '#000'; // black background
  context.fillRect(0, 0, canvas.width, canvas.height); // clear canvas
  drawMatrix(arena, {x:0, y:0}); // draw arena at origin
  drawMatrix(player.matrix, player.pos); // draw current piece at its position
}

// Checks if player piece collides with walls or blocks
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  /*Essentially, for each row and column we check:
    1) Is the cell occupied?
    2.1) Row exists in arena
    2.2) Arena cell is not zero.
  */
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// Lock player piece
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) { // If the block is present
        arena[y + player.pos.y][x + player.pos.x] = value; // We lock it into place
      }
    });
  });
}

// Remove any full rows from the arena and update score
function arenaSweep() {
  // We start from the buttom and check each row for empty cells. If there is one, we skip the row.
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0); // Remove the full row and clear it
    arena.unshift(row); // Add an empty row on top
    ++y; // We need to recheck this index
    player.score += 100; // For now each row gives us 100 Points (new multiply factor for speed or multiple rows)
  }
  document.getElementById('score').innerText = 'Score: ' + player.score; // Update score in HTML
}

// Matrix Rotation (I actually remember this from Linear Algebra)
function rotate(matrix, dir) {
  // Here we transpose. Meaning, that we change rows with columns. Notice, that the diagonale stays the same.
  /*
    Let's actually look at an example:

    1 | 2 | 3
    4 | 5 | 6
    7 | 8 | 9

    Transposed:

    1 | 4 | 7
    2 | 5 | 8
    3 | 6 | 9
  */
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse()); /* If we want to rotate by 90 degrees clockwise, we can simply take the tranposed matrix and reverse each row. Hence,
    the last row from the original becomes the first column of the new matrix, the first row of the original becomes the last column of the new matrix, etc.*/
  } else {
    matrix.reverse(); // If we want to turn the matrix counter-clockwise, we simply reverse the row order. For example, the first row stays the first column but starts with the last element of the original first row.
  }
}

// Spawns a new random piece at the top of the arena
function playerReset() {
  const piecesKeys = Object.keys(pieces);
  player.matrix = createPiece(piecesKeys[piecesKeys.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0); // center horizontally: half arena width minus half piece width
  // If this newly spawned piece already collides, then we have a gameover (for now, we simply reset the board and the score)
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    document.getElementById('score').innerText = 'Score: ' + player.score;
  }
}

// Drops the piece by one row
function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player); // Lock the piece in place
    playerReset(); // Spawn new piece
    arenaSweep(); // Check if we can clear any rows
  }
  dropCounter = 0;
}

// Move the piece to the left or right (-1 or 1)
function playerMove(dir) {
  player.pos.x += dir;
  // If we hit a wall or block revert the move
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

// Rotate piece, with wall kicks (https://tetris.fandom.com/wiki/Wall_kick) if necessary
function playerRotate(dir) {
  const pos = player.pos.x;
  rotate(player.matrix, dir); // Rotate
  let offset = 1;
  // If the rotated piece now collides, we shift horizontally (either left or right) by an increasing zig-zag pattern
  while (collide(arena, player)) {
    player.pos.x += offset; // Shift horizontally either left or right
    offset = -(offset + (offset > 0 ? 1 : -1)); // Alternate the offset to increasingly be further right or left 
    if (offset > player.matrix[0].length) { // If the offset exceeds the size of the current piece, give up and undo the rotation
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0; // Time since last drop
let dropInterval = 1000; // New drop every 1 sec
let lastTime = 0; // timestamp of last frame

// Game loop: update drop timer, redraw, and request next frame
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw(); // Redraw Scene
  requestAnimationFrame(update); // schedule next update
}

// Map color to piece by piece ID
const colors = [
  null,
  '#00f0f0', // I
  '#0000f0', // J
  '#f0a000', // L
  '#f0f000', // O
  '#00f000', // S
  '#a000f0', // T
  '#f00000'  // Z
];

// Initialize arena (10x20), player state, and controls
const arena = createMatrix(10, 20);
const player = { pos: {x:0, y:0}, matrix: null, score: 0 };

// Listen for arrow keys and Q/E to move/rotate/drop
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'q') playerRotate(-1);
  else if (event.key === 'e') playerRotate(1);
});

playerReset(); // start first piece
update(); // This begins the gameplay loop