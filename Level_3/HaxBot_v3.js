/*

Changelog : Stats globales, AFK, meilleur système pr l'après game, slow mode

*/

/* VARIABLES */

/* ROOM */

const roomName = " ⭐ FUTSAL | Stats et plus ! ⭐";
const botName = "BOT";
const maxPlayers = 12;
const roomPublic = true;
const geo = [{"code": "DE", "lat": 51.1, "lon": 10.4}, {"code": "FR", "lat": 46.2, "lon": 2.2}, {"code": "PL", "lat": 51.9, "lon": 19.1}, {"code": "GB", "lat": 55.3, "lon": -3.4}];
const scoreLimit = 3;
const timeLimit = 3;
const Team = {
	SPECTATORS: 0,
	RED: 1,
	BLUE: 2
};
const adminPassword = 1000 + getRandomInt(9000);
console.log("adminPassword : " + adminPassword);

const room = HBInit({roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[1]});

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);

/* STADIUM */

const playerRadius = 15;
var ballRadius = 10;

/* OPTIONS */

var afkLimit = 13;
var drawTimeLimit = Infinity;
var maxTeamSize = 4;

/* PLAYERS */

var players;
var teamR;
var teamB;
var teamS;

/* GAME */

var inactivityPlayers = new Array(2 * maxTeamSize).fill(0);
var countAFK = false;
const triggerDistance = playerRadius + ballRadius + 0.01;
var lastTeamTouched;
var lastPlayersTouched;
var goldenGoal = false;
var activePlay = false;
var muteList = [];
var timeOutCap;

/* STATS */

var game;
var GKList = new Array(2 * maxTeamSize).fill(0);
var Rposs = 0;
var Bposs = 0;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var lastWinner = Team.SPECTATORS;
var streak = 0;

/* AUXILIARY */

var count_stats = 0;

/* OBJECTS */

function Goal(time, team, striker, assist) {
	this.time = time;
	this.team = team;
	this.striker = striker;
	this.assist = assist;
}

function Game(date, scores, goals) {
	this.date = date;
	this.scores = scores;
	this.goals = goals;
}

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // return random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function arrayMin(arr) {
	var len = arr.length, min = Infinity;
	while (len--) {
		if (arr[len] < min) {
			min = arr[len];
	  	}
	}
	return min;
}

function getTime(scores) {
	return "[" + Math.floor(Math.floor(scores.time/60)/10).toString() + Math.floor(Math.floor(scores.time/60)%10).toString() + ":" + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))/10).toString() + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))%10).toString() + "]"
}

function pointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
}

/* BUTTONS */

function topBtn() {
	if (teamS.length == 0) {
		return;
	}
	else {
		if (teamR.length == teamB.length) {
			if (teamS.length > 1) {
				room.setPlayerTeam(teamS[0].id,Team.RED);
				room.setPlayerTeam(teamS[1].id,Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[0].id,Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[0].id,Team.BLUE);
		}
	}
}

function randomBtn() {
	if (teamS.length == 0) {
		return;
	}
	else {
		if (teamR.length == teamB.length) {
			if (teamS.length > 1) {
				var r = getRandomInt(teamS.length);
				room.setPlayerTeam(teamS[r].id,Team.RED);
				teamS = teamS.filter((spec) => spec.id != teamS[r].id);
				room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id,Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id,Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id,Team.BLUE);
		}
	}
}

function blueToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
	}
}

function redToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
	}
}

function resetBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	if (teamR.length <= teamB.length) {
		for (var i = 0; i < teamR.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
		for (var i = teamR.length; i < teamB.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
		}
	}
	else {
		for (var i = 0; i < teamB.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
		for (var i = teamB.length; i < teamR.length; i++) {
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
	}
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	game.scores = scores;
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01) {
		if (scores.red != scores.blue) {
			if (scores.red > scores.blue) {
				endGame(Team.RED);
				setTimeout(function(){ room.stopGame(); }, 2000);
			}
			else {
				endGame(Team.BLUE);
				setTimeout(function(){ room.stopGame(); }, 2000);
			}
			return;
		}
		goldenGoal = true;
		room.sendChat("⚽ First goal wins! ⚽");
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		room.sendChat("⌛ 60 seconds left until draw! ⌛");
		return;
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) {
		endGame(Team.SPECTATORS);
		room.stopGame();
		goldenGoal = false;
		return;
	}
}

function endGame(winner) { // no stopGame() function in it
	const scores = room.getScores();
	game.scores = scores;
	Rposs = Rposs/(Rposs+Bposs);
	Bposs = 1 - Rposs;
	if (winner == Team.RED) {
		lastWinner = Team.RED;
		streak++;
		room.sendChat("🔴 Red Team won " + scores.red + "-" + scores.blue + " ! Current streak : " + streak + " 🏆");
		room.sendChat("⭐ Possession : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵");
		if (scores.blue == 0) {
			room.sendChat("🏆 " + teamR[GKList.slice(0, maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(0, maxTeamSize)))].name + " kept a CS ! ");
		}
	}
	else if (winner == Team.BLUE) {
		lastWinner = Team.BLUE;
		streak = 1;
		room.sendChat("🔵 Blue Team won " + scores.blue + "-" + scores.red + " ! Current streak : " + streak + " 🏆");
		room.sendChat("⭐ Possession : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵");
		if (scores.red == 0) {
			room.sendChat("🏆 " + teamB[GKList.slice(maxTeamSize, 2 * maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(maxTeamSize, 2 * maxTeamSize)))].name + " kept a CS ! ");
		}
	}
	else {
		lastWinner = Team.SPECTATORS;
		streak = 0;
		room.sendChat("💤 Draw limit reached! 💤");
		room.sendChat("⭐ Possession : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵");
		if (scores.red == 0) {
			room.sendChat("🏆 " + teamB[GKList.slice(maxTeamSize, 2 * maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(maxTeamSize, 2 * maxTeamSize)))].name + " and " + teamR[GKList.slice(0, maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(0, maxTeamSize)))].name + " kept a CS ! ");
		}
	}
	updateStats(winner);
}

function quickPause() {
	room.pauseGame(true);
	setTimeout(function() { room.pauseGame(false); }, 1000);
}

function quickRestart() {
	room.stopGame();
	setTimeout(function() { room.startGame(); }, 2000);
}

function resumeGame() {
	setTimeout(function() { room.startGame(); }, 2000);
	setTimeout(function() { room.pauseGame(false); }, 1000);
}

function balanceTeams() {
	if (players.length == 1 && teamR.length == 0) {
		quickRestart();
		room.setPlayerTeam(players[0].id, Team.RED);
	}
	else if (Math.abs(teamR.length - teamB.length) == teamS.length && teamS.length > 0) {
		const n = Math.abs(teamR.length - teamB.length);
		if (players.length == 2) {
			quickRestart();
		}
		if (teamR.length > teamB.length) {
			for (var i = 0 ; i < n ; i++) {
				room.setPlayerTeam(teamS[i].id, Team.BLUE);
			}
		}
		else {
			for (var i = 0 ; i < n ; i++) {
				room.setPlayerTeam(teamS[i].id, Team.RED);
			}
		}
	}
	else if (Math.abs(teamR.length - teamB.length) > teamS.length) {
		const n = Math.abs(teamR.length - teamB.length);
		if (players.length == 1) {
			room.setPlayerTeam(players[0].id, Team.RED);
			return;
		}
		if (teamR.length > teamB.length) {
			for (var i = 0 ; i < n ; i++) {
				room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
			}
		}
		else {
			for (var i = 0 ; i < n ; i++) {
				room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			}
		}
	}
	else if (Math.abs(teamR.length - teamB.length) < teamS.length && teamR.length != teamB.length) {
		room.pauseGame(true);
	}
	else if (teamS.length >= 2 && teamR.length == teamB.length && teamR.length < maxTeamSize) {
		room.setPlayerTeam(teamS[0].id, Team.RED);
		room.setPlayerTeam(teamS[1].id, Team.BLUE);
	}
}

/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList().filter((player) => player.id != 0);
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}

function updateAdmins() {
	if (players.length == 0 || players.find((player) => player.admin) != null) {
		return;
	}
	var copie = []; 
	players.forEach(function(element){ copie.push(element.id); });
	room.setPlayerAdmin(arrayMin(copie), true); // Give admin to the player who's played the longest on the room
}

function updateLists(number, team) {
	if (room.getScores() != null) {
		if (team == Team.RED) { // virer des listes les joueurs qui partent en plein match (salauds...)
			const partG1 = GKList.slice(0, number).concat(GKList.slice(number + 1, maxTeamSize)).concat(0);
			const partD1 = GKList.slice(maxTeamSize, GKList.length);
			GKList = partG1.concat(partD1);
			const partG2 = inactivityPlayers.slice(0, number).concat(inactivityPlayers.slice(number + 1, maxTeamSize)).concat(0);
			const partD2 = inactivityPlayers.slice(maxTeamSize, inactivityPlayers.length);
			inactivityPlayers = partG2.concat(partD2);
		}
		else if (team == Team.BLUE) {
			const partG1 = GKList.slice(0, maxTeamSize + number);
			const partD1 = GKList.slice(maxTeamSize + number + 1, GKList.length).concat(0);
			GKList = partG1.concat(partD1);
			const partG2 = inactivityPlayers.slice(0, maxTeamSize + number);
			const partD2 = inactivityPlayers.slice(maxTeamSize + number + 1, inactivityPlayers.length).concat(0);
			inactivityPlayers = partG2.concat(partD2);
		}
	}
}

function handleInactivity() {
	if (countAFK && players.length > 1) {
		for (var i = 0; i < teamR.length ; i++) {
			inactivityPlayers[i] += 1;
		}
		for (var i = 0; i < teamB.length ; i++) {
			inactivityPlayers[maxTeamSize + i] += 1;
		}
	}
	for (var i = 0; i < inactivityPlayers.length ; i++) {
		if (inactivityPlayers[i] >= 60 * afkLimit) {
			inactivityPlayers[i] = 0;
			if (room.getScores().time <= afkLimit - 0.5) {
				setTimeout(function() { room.stopGame(); }, 500);
			}
			if (i >= maxTeamSize) {
				room.kickPlayer(teamB[i - maxTeamSize].id,"AFK",false);
			}
			else {
				room.kickPlayer(teamR[i].id,"AFK",false);
			}
		}
	}
}

/* STATS FUNCTIONS */

function getLastTouchOfTheBall() {
	const ballPosition = room.getBallPosition();
	players = room.getPlayerList().filter((player) => player.id != 0);
	for (var i = 0; i < players.length; i++) {
		if (players[i].position != null) {
			var distanceToBall = pointDistance(players[i].position, ballPosition);
			if (distanceToBall < triggerDistance) {
				if (!activePlay) {
					activePlay = true;
				}
				lastTeamTouched = players[i].team;
			}
		}
	}
}

function getStats() { // gives possession, ball speed and GK of each team
	if (activePlay) {
        players = room.getPlayerList().filter((player) => player.id != 0);
        teamS = players.filter(p => p.team === Team.SPECTATORS);
        teamR = players.filter(p => p.team === Team.RED);
        teamB = players.filter(p => p.team === Team.BLUE);
		if (lastTeamTouched == Team.RED) {
			Rposs++;
		}
		else {
			Bposs++;
		}
		var ballPosition = room.getBallPosition();
		point[1] = point[0];
		point[0] = ballPosition;
		ballSpeed = (pointDistance(point[0], point[1])*60*60*60)/15000;
		var k = [-1,Infinity];
		for (var i = 0; i < teamR.length; i++) {
			if (teamR[i].position.x < k[1]) {
				k[0] = i;
				k[1] = teamR[i].position.x;
			}
		}
		GKList[k[0]]++;
		k = [-1,-Infinity];
		for (var i = 0; i < teamB.length; i++) {
			if (teamB[i].position.x > k[1]) {
				k[0] = i;
				k[1] = teamB[i].position.x;
			}
		}
		GKList[maxTeamSize + k[0]]++;
	}
}

function updateStats(winner) {
	if (players.length >= 2 * maxTeamSize && (game.scores.time >= (5/6) * game.scores.timeLimit || game.scores.red == game.scores.scoreLimit || game.scores.blue == game.scores.scoreLimit) && allReds.length > 3 && allBlues.length > 3) {
		for (var i = 0; i < allReds.length ; i++) {
			if (localStorage.getItem(allReds[i])) {
				var stats = JSON.parse(localStorage.getItem(allReds[i]));
			}
			else {
				var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00"];
			}
			stats[0]++;
			if (winner == Team.RED) {
				stats[1]++;
			}
			else if (winner == Team.BLUE) {
				stats[3]++;
			}
			else {
				stats[2]++;
			}
			stats[4] = (100*stats[1]/stats[0]).toPrecision(3);
			localStorage.setItem(allReds[i], JSON.stringify(stats));
		}
		for (var i = 0; i < allBlues.length ; i++) {
			if (localStorage.getItem(allBlues[i])) {
				var stats = JSON.parse(localStorage.getItem(allBlues[i]));
			}
			else {
				var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00"];
			}
			stats[0]++;
			if (winner == Team.BLUE) {
				stats[1]++;
			}
			else if (winner == Team.RED) {
				stats[3]++;
			}
			else {
				stats[2]++;
			}
			stats[4] = (100*stats[1]/stats[0]).toPrecision(3);
			localStorage.setItem(allBlues[i], JSON.stringify(stats));
		}
		for (var i = 0; i < game.goals.length ; i++) {
			if ((allBlues.concat(allReds)).findIndex((player) => player == game.goals[i].striker) != -1) {
				var stats = JSON.parse(localStorage.getItem(game.goals[i].striker));
				stats[5]++;
				localStorage.setItem(game.goals[i].striker, JSON.stringify(stats));
			}
			if ((allBlues.concat(allReds)).findIndex((player) => player == game.goals[i].assist) != -1) {
				var stats = JSON.parse(localStorage.getItem(game.goals[i].assist));
				stats[6]++;
				localStorage.setItem(game.goals[i].assist, JSON.stringify(stats));
			}
		}
		if ((allBlues.concat(allReds)).findIndex((player) => player == teamR[GKList.slice(0, maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(0, maxTeamSize)))].name) != -1) {
			var stats = JSON.parse(localStorage.getItem(teamR[GKList.slice(0, maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(0, maxTeamSize)))].name));
			stats[7]++;
			if (game.scores.blue == 0 && winner != Team.BLUE) {
				stats[8]++;
			}
			stats[9] = (100*stats[8]/stats[7]).toPrecision(3);
			localStorage.setItem(teamR[GKList.slice(0, maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(0, maxTeamSize)))].name, JSON.stringify(stats));
		}
		if ((allBlues.concat(allReds)).findIndex((player) => player == teamB[GKList.slice(maxTeamSize, 2 * maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(maxTeamSize, 2 * maxTeamSize)))].name) != -1) {
			var stats = JSON.parse(localStorage.getItem(teamB[GKList.slice(maxTeamSize, 2 * maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(maxTeamSize, 2 * maxTeamSize)))].name));
			stats[7]++;
			if (game.scores.red == 0 && winner != Team.RED) {
				stats[8]++;
			}
			stats[9] = (100*stats[8]/stats[7]).toPrecision(3);
			localStorage.setItem(teamB[GKList.slice(maxTeamSize, 2 * maxTeamSize).findIndex(p => p == Math.max(...GKList.slice(maxTeamSize, 2 * maxTeamSize)))].name, JSON.stringify(stats));
		}
	}
}

setInterval(function() {
	var tableau = [];
	if (count_stats % 5 == 0) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[0])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Games> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (count_stats % 5 == 1) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[1])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	if (count_stats % 5 == 2) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[5])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (count_stats % 5 == 3) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[6])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (count_stats % 5 == 4) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[8])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	count_stats++;
}, 6 * 60 * 1000);

/* EVENTS */

room.onPlayerJoin = function(player) {
	room.sendChat("👋 Welcome " + player.name + " !");
	updateTeams();
	updateAdmins();
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	if (changedPlayer.id == 0) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		return;
	}
	if (room.getScores() != null) {
		var scores = room.getScores();
		if (changedPlayer.team != Team.SPECTATORS && scores.time <= (3/4) * scores.timeLimit  && Math.abs(scores.blue - scores.red) < 2) {
			if (changedPlayer.team == Team.RED) {
				allReds.push(changedPlayer.name);
			}
			else {
				allBlues.push(changedPlayer.name);
			}
		}
	}
	if (changedPlayer.team == Team.SPECTATORS) {
		updateLists(Math.max(teamR.findIndex((p) => p.id == changedPlayer.id), teamB.findIndex((p) => p.id == changedPlayer.id), teamS.findIndex((p) => p.id == changedPlayer.id)), changedPlayer.team);
	}
	updateTeams();
}

room.onPlayerLeave = function(player) {
	room.sendChat("👋 Goodbye " + player.name + " !");
	updateLists(Math.max(teamR.findIndex((p) => p.id == player.id), teamB.findIndex((p) => p.id == player.id), teamS.findIndex((p) => p.id == player.id)), player.team);
	updateTeams();
	updateAdmins();
	if (players.length == maxTeamSize * 2 - 1) {
		allReds = [];
		allBlues = [];
	}
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	if (player.team != Team.SPECTATORS) {
		if (player.team == Team.RED) {
			inactivityPlayers[teamR.findIndex(((red) => red.id == player.id))] = 0;
		}
		else {
			inactivityPlayers[maxTeamSize + teamB.findIndex(((blue) => blue.id == player.id))] = 0;
		}
	}
	if (message[0].toLowerCase() == "!help") {
		room.sendChat("Player commands : !me, !playerstats <nick>.");
		room.sendChat("Admin : !balance, !mute <team> <position> <duration (default 3)>, !unmute all or !unmute <nick>, !clearbans");
	}
	if (message[0].toLowerCase() == "!me") {
		if (localStorage.getItem(player.name)) {
			var stats = JSON.parse(localStorage.getItem(player.name));
		}
		else {
			var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00"];
		}
		room.sendChat(player.name + "> Game: " + stats[0] + ", Win: " + stats[1] + ", Draw: " + stats[2] + ", Loss: " + stats[3] + ", WR: " + stats[4] + "%, Goal: " + stats[5] + ", Assist: " + stats[6] + ", GK: " + stats[7] + ", CS: " + stats[8] + ", CS%: " + stats[9] + "%");
	}
	if (message[0].toLowerCase() == "!playerstats") {
		if (message.length >= 2) {
			var name = "";
			for (var i = 1 ; i < message.length ; i++) {
				name += message[i] + " ";
			}
			name = name.substring(0,name.length - 1);
			if (localStorage.getItem(name)) {
				if (!["player_name", "view_mode", "geo", "avatar"].includes(name)) {
					var stats = JSON.parse(localStorage.getItem(name));
					room.sendChat(name + "> Game: " + stats[0] + ", Win: " + stats[1] + ", Draw: " + stats[2] + ", Loss: " + stats[3] + ", WR: " + stats[4] + "%, Goal: " + stats[5] + ", Assist: " + stats[6] + ", GK: " + stats[7] + ", CS: " + stats[8] + ", CS%: " + stats[9] + "%");
				}
			}
		}
	}
	if (message[0].toLowerCase() == "!games") {
		if (player.admin) {
			var tableau = [];
			Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[0])]); } });
			if (tableau.length < 5) {
				return false;
			}
			tableau.sort(function(a, b) { return b[1] - a[1]; });
			room.sendChat("Games> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	}
	if (message[0].toLowerCase() == "!wins") {
		if (player.admin) {
			var tableau = [];
			Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[1])]); } });
			if (tableau.length < 5) {
				return false;
			}
			tableau.sort(function(a, b) { return b[1] - a[1]; });
			room.sendChat("Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	}
	if (message[0].toLowerCase() == "!goals") {
		if (player.admin) {
			var tableau = [];
			Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[5])]); } });
			if (tableau.length < 5) {
				return false;
			}
			tableau.sort(function(a, b) { return b[1] - a[1]; });
			room.sendChat("Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	}
	if (message[0].toLowerCase() == "!assists") {
		if (player.admin) {
			var tableau = [];
			Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[6])]); } });
			if (tableau.length < 5) {
				return false;
			}
			tableau.sort(function(a, b) { return b[1] - a[1]; });
			room.sendChat("Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	}
	if (message[0].toLowerCase() == "!cs") {
		if (player.admin) {
			var tableau = [];
			Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[8])]); } });
			if (tableau.length < 5) {
				return false;
			}
			tableau.sort(function(a, b) { return b[1] - a[1]; });
			room.sendChat("CS> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	}
	if (message[0].toLowerCase() == '!claim') {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
		}
	}
	if (message[0].toLowerCase() == "!balance") {
		if (player.admin) {
			for (var i = 0; i < 4; i++) {
				balanceTeams();
			} 
		}
	}
	if (message[0].toLowerCase() == "!mute") {
		if (player.admin) {
			if (message.length == 3 || message.length == 4) {
				if (["R","B","S"].includes(message[1])) {
					var minutes;
					if (!Number.isNaN(Number.parseInt(message[2]))) {
						if (Number.parseInt(message[2]) <= teamR.length || Number.parseInt(message[2]) > 0) {
							if (message.length == 4) {
								if (!Number.isNaN(Number.parseInt(message[3]))) {
									if (Number.parseInt(message[3]) > 0) {
										timeOut = Number.parseInt(message[3]) * 60 * 1000;
									}
								}
							}
							else {
								timeOut = 3 * 60 * 1000;
							}
						}
					}
					if (message[1] == "R") {
						setTimeout(function(name) { muteList = muteList.filter((p) => p != name) }, timeOut, teamR[Number.parseInt(message[2]) - 1].name);
						muteList.push(teamR[Number.parseInt(message[2]) - 1].name);
						room.sendChat(teamR[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
					}
					if (message[1] == "B") {
						setTimeout(function(name) { muteList = muteList.filter((p) => p != name) }, timeOut, teamB[Number.parseInt(message[2]) - 1].name);
						muteList.push(teamB[Number.parseInt(message[2]) - 1].name);
						room.sendChat(teamB[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
					}
					if (message[1] == "S") {
						setTimeout(function(name) { muteList = muteList.filter((p) => p != name) }, timeOut, teamS[Number.parseInt(message[2]) - 1].name);
						muteList.push(teamS[Number.parseInt(message[2]) - 1].name);
						room.sendChat(teamS[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
					}
				}
			}
		}
		return false;
    }
    if (message[0].toLowerCase() == "!unmute") {
    }
	if (message[0].toLowerCase() == "!clearbans") {
		if (player.admin) {
			room.clearBans();
			room.sendChat("Bans cleared");
		}
		return false;
	}
	if (message[0][0] == "!") {
		return false;
	}
	if (muteList.includes(player.name)) {
		return false;
	}
}

room.onPlayerActivity = function(player) {
	if (player.team == Team.BLUE) {
		inactivityPlayers[maxTeamSize + teamB.findIndex((blue) => blue.id == player.id)] = 0;
	}
	else if (player.team == Team.RED) {
		inactivityPlayers[teamR.findIndex(((red) => red.id == player.id))] = 0;
	}
	return;
}

room.onGameStart = function(byPlayer) {
	game = new Game(Date.now(),room.getScores(),[]);
	countAFK = true;
	goldenGoal = false;
	lastPlayersTouched = [null, null];
    Rposs = 0;
	Bposs = 0;
	GKList = new Array(2 * maxTeamSize).fill(0);
	inactivityPlayers = new Array(2 * maxTeamSize).fill(0);
	allReds = [];
	allBlues = [];
	if (teamR.length == maxTeamSize && teamB.length == maxTeamSize) {
		for (var i = 0; i < maxTeamSize; i++) {
			allReds.push(teamR[i].name);
			allBlues.push(teamB[i].name);
		}
	}
}

room.onGameStop = function(byPlayer) {
    if (byPlayer.id == 0) {
        if (lastWinner == Team.RED) {
            blueToSpecBtn();
            setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 1000);
        }
        else if (lastWinner == Team.BLUE) {
            redToSpecBtn();
            var n = teamB.length;
            for (var i = 0; i < n; i++) {
                setTimeout(function() { room.setPlayerTeam(teamB[0].id,Team.RED); }, 2*i);
            }
            setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 1000);
            lastWinner == Team.RED;
        }
        else {
            redToSpecBtn();
            blueToSpecBtn();
            setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.RED); }, 1000);
            setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 2000);
        }
    }
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
	activePlay = false;
	const scores = room.getScores();
	game.scores = scores;
	if (team == Team.RED) {
		if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == Team.RED) {
			if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == Team.RED) {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
				game.goals.push(new Goal(scores.time, Team.RED, lastPlayersTouched[0], lastPlayersTouched[1]));
			}
			else {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
				game.goals.push(new Goal(scores.time, Team.RED, lastPlayersTouched[0], null));
			}
		}
		else {
			room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			game.goals.push(new Goal(scores.time, Team.RED, null, null));
		}
		if (scores.red == scores.scoreLimit || goldenGoal == true) {
			endGame(Team.RED);
			goldenGoal = false;
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
	else {
		if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == Team.BLUE) {
			if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == Team.BLUE) {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔵");
				game.goals.push(new Goal(scores.time, Team.BLUE, lastPlayersTouched[0], lastPlayersTouched[1]));
			}
			else {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔵");
				game.goals.push(new Goal(scores.time, Team.BLUE, lastPlayersTouched[0], null));
			}
		}
		else {
			room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔵");
			game.goals.push(new Goal(scores.time, Team.BLUE, null, null));
		}
		if (scores.blue == scores.scoreLimit || goldenGoal == true) {
			endGame(Team.BLUE);
			goldenGoal = false;
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
}

room.onPositionsReset = function() {
	countAFK = true;
	lastPlayersTouched = [null, null];
}

room.onPlayerBallKick = function(player) {
	if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
        if (!activePlay) {
            activePlay = true;
        }
        lastTeamTouched = player.team;
		lastPlayersTouched[1] = lastPlayersTouched[0];
		lastPlayersTouched[0] = player;
	}
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
	checkTime();
	getStats();
	handleInactivity();
}
