const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20); // each block is 20x20px

// Create the playfield matrix
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

    // Tetromino shapes
    const pieces = {
      'I': [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
      'J': [[2,0,0],[2,2,2],[0,0,0]],
      'L': [[0,0,3],[3,3,3],[0,0,0]],
      'O': [[4,4],[4,4]],
      'S': [[0,5,5],[5,5,0],[0,0,0]],
      'T': [[0,6,0],[6,6,6],[0,0,0]],
      'Z': [[7,7,0],[0,7,7],[0,0,0]]
    };

    function createPiece(type) {
      return pieces[type];
    }

    // Draw matrix to canvas
    function drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    }

    function draw() {
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawMatrix(arena, {x:0, y:0});
      drawMatrix(player.matrix, player.pos);
    }

    // Check collision
    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    }

    // Merge player piece into arena
    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    }

    // Clear full rows
    function arenaSweep() {
      outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
          if (arena[y][x] === 0) {
            continue outer;
          }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += 10;
      }
      document.getElementById('score').innerText = 'Score: ' + player.score;
    }

    // Rotate matrix
    function rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      if (dir > 0) {
        matrix.forEach(row => row.reverse());
      } else {
        matrix.reverse();
      }
    }

    function playerReset() {
      const piecesKeys = Object.keys(pieces);
      player.matrix = createPiece(piecesKeys[piecesKeys.length * Math.random() | 0]);
      player.pos.y = 0;
      player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
      if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        document.getElementById('score').innerText = 'Score: ' + player.score;
      }
    }

    function playerDrop() {
      player.pos.y++;
      if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
      }
      dropCounter = 0;
    }

    function playerMove(dir) {
      player.pos.x += dir;
      if (collide(arena, player)) {
        player.pos.x -= dir;
      }
    }

    function playerRotate(dir) {
      const pos = player.pos.x;
      rotate(player.matrix, dir);
      let offset = 1;
      while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
          rotate(player.matrix, -dir);
          player.pos.x = pos;
          return;
        }
      }
    }

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        playerDrop();
      }
      draw();
      requestAnimationFrame(update);
    }

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

    const arena = createMatrix(10, 20);
    const player = { pos: {x:0, y:0}, matrix: null, score: 0 };

    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') playerMove(-1);
      else if (event.key === 'ArrowRight') playerMove(1);
      else if (event.key === 'ArrowDown') playerDrop();
      else if (event.key === 'q') playerRotate(-1);
      else if (event.key === 'e') playerRotate(1);
    });

    playerReset();
    update();