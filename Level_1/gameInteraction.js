/** COMMENTARY

The game interaction has 4 things in it : 
1) Getting the teams accurately
2) Getting the informations that will be displayed for the goal : Goal Speed and the last 2 players that kicked the ball
3) Interacting with time
4) Dealing with time and goals to end the game quickly

*/

/* VARIABLES */

/* OPTIONS */

var drawTimeLimit = Infinity;

/* PLAYERS */

var players;
var teamR;
var teamB;
var teamS;

/* GAME */

var lastPlayersTouched;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var goldenGoal = false;

/* AUXILIARY */

var checkTimeVariable = 0;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getTime(scores) { // Getting a clean time with 4 digits
	return "[" + Math.floor(Math.floor(scores.time/60)/10).toString() + Math.floor(Math.floor(scores.time/60)%10).toString() + ":" + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))/10).toString() + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))%10).toString() + "]"
}

function pointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01) { // Case where timeLimit is reached
		if (scores.red != scores.blue) {
			checkTimeVariable += 1;
			if (checkTimeVariable == 1) {
				if (scores.red > scores.blue) {
					endGame(Team.RED);
					room.stopGame();
				}
				else {
					endGame(Team.BLUE);
					room.stopGame();
				}
			}
			setTimeout(function() { checkTimeVariable = 0; }, 10); 
			return;
		}
		goldenGoal = true;
		room.sendChat("⚽ First goal wins! ⚽");
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) { // Case where drawTimeLimit will be reached in 1 minute 
		checkTimeVariable += 1;
		if (checkTimeVariable == 1) {
			room.sendChat("⌛ 60 seconds left until draw! ⌛");
			setTimeout(function() { checkTimeVariable = 0; }, 10); 
			return;
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) { // Case where drawTimeLimit is reached
		checkTimeVariable += 1;
		if (checkTimeVariable == 1) {
			endGame(Team.SPECTATORS);
			room.stopGame();
			setTimeout(function() { checkTimeVariable = 0; }, 10); 
			return;
		}
	}
}

function endGame(winner) { // No stopGame function in it
	if (winner == Team.RED) {
		room.sendChat("🔴 Red Team won " + game.scores.red + "-" + game.scores.blue + "!");
	}
	else if (winner == Team.BLUE) {
		room.sendChat("🔵 Blue Team won " + game.scores.blue + "-" + game.scores.red + "!");
	}
	else {
		room.sendChat("💤 Draw limit reached! 💤");
	}
}

/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList().filter((player) => player.id != 0);
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}

/* STATS FUNCTIONS */

function getStats() { // Gets a speed which looks coherent, feel free to change the coefficients
	const ballPosition = room.getBallPosition();
	point[1] = point[0];
	point[0] = ballPosition;
	ballSpeed = (pointDistance(point[0], point[1])*60*60*60)/15000;
}

/* EVENTS */

room.onPlayerJoin = function(player) {
	room.sendChat("Welcome " + player.name + " !");
	updateTeams();
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	if (changedPlayer.id == 0) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		return;
	}
	updateTeams();
}

room.onPlayerLeave = function(player) {
	room.sendChat("Goodbye " + player.name + " !");
	updateTeams();
}

room.onGameStart = function(byPlayer) {
	lastPlayersTouched = [null, null];
}

room.onTeamGoal = function(team) {
	const scores = room.getScores();
	if (team == Team.RED) {
		if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == Team.RED) {
			if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == Team.RED) {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
			else {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
		}
		else {
			room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
		}
		if (scores.red == scores.scoreLimit || goldenGoal == true) {
			endGame(Team.RED);
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
	else {
		if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == Team.BLUE) {
			if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == Team.BLUE) {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
			else {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
		}
		else {
			room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
		}
		if (scores.blue == scores.scoreLimit || goldenGoal == true) {
			endGame(Team.BLUE);
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
}

room.onPositionsReset = function() {
	lastPlayersTouched = [null, null];
}

room.onPlayerBallKick = function(player) {
	if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
		lastPlayersTouched[1] = lastPlayersTouched[0];
		lastPlayersTouched[0] = player;
	}
}

room.onGameTick = function() {
	checkTime();
	getStats();
}
