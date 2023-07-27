const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is RUNNING...`);
    });
  } catch (error) {
    console.log(`DBServer ${error.message}`);
    process.exit(1);
  }
};

initializeDBserver();

//API 1
//Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const dbQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    `;

  const array = await db.all(dbQuery);
  response.send(array);
});

//API 2
//Returns a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    WHERE 
    player_id = ${playerId}
    `;

  const array = await db.get(dbQuery);
  response.send(array);
});

//API 3
//Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const dbQuery = `
    UPDATE 
    player_details
    SET 
    player_name = '${playerName}'
    WHERE 
    player_id = ${playerId}
    `;

  const array = await db.run(dbQuery);
  response.send("Player Details Updated");
});

//API 4
//Returns the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const dbQuery = `
    SELECT 
    match_id AS matchId,
    match,
    year 
    FROM 
    match_details
    WHERE 
    match_id = ${matchId}
    `;

  const array = await db.get(dbQuery);
  response.send(array);
});

//API 5
//Returns a list of all the matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `
    SELECT 
    match_id AS matchId,
    match,
    year 
    FROM 
    match_details NATURAL JOIN player_match_score
    WHERE 
    player_id = ${playerId}
    
    `;

  const array = await db.all(dbQuery);
  response.send(array);
});

//API 6
//Returns a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const dbQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName 
    FROM 
    player_details NATURAL JOIN player_match_score
    WHERE 
    match_id = ${matchId}
    `;

  const array = await db.all(dbQuery);
  response.send(array);
});

//API 7
//Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM 
    player_details NATURAL JOIN player_match_score
    WHERE 
    player_id = ${playerId}
     GROUP BY 
    player_id
    
    `;

  const array = await db.get(dbQuery);
  response.send(array);
});

module.exports = app;
