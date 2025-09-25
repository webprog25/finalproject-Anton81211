async function loadScores() {
  // Extract game name from query string e.g.: ?game=tetris
  const params = new URLSearchParams(window.location.search);
  const game = params.get("game");

  if (!game) {
    document.getElementById("title").textContent = "No game specified";
    return;
  }

  const gameName = game.charAt(0).toUpperCase() + game.slice(1); // Capitalize only the first letter of the game name
  document.getElementById("title").textContent = `${gameName} Scores`; // Set the title

  try {
    const res = await fetch(`/api/scores/${game}`); // Get request for game scores
    const scores = await res.json();

    const tbody = document.querySelector("#scoresTable tbody"); // Select the scores table and start inserting at the first row
    tbody.innerHTML = "";

    // Insert each row from the json
    for (var i = 0; i < scores.length; i++) {
      var row = scores[i];
      var tr = document.createElement("tr");
      tr.innerHTML = 
        "<td>" + (i + 1) + "</td>" + // Start counting at 1 not at 0
        "<td>" + row.name + "</td>" +
        "<td>" + row.score + "</td>";
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("Failed to load scores:", err);
  }
}
// Runs when the page is loaded
loadScores();