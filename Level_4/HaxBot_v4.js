// Stats: "Auth" : '["0-Games", "1-Wins", "2-Draws", "3-Losses", "4-Winrate", "5-Goals", "6-Assists", "7-GK", "8-CS", "9-CS%", "10-Nick", "11-PW"]'

/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const botName = "HaxBot";
const maxPlayers = 12;
const roomPublic = true;
const geo = [{"code": "DE", "lat": 51.1, "lon": 10.4}, {"code": "FR", "lat": 46.2, "lon": 2.2}, {"code": "PL", "lat": 51.9, "lon": 19.1}, {"code": "GB", "lat": 55.3, "lon": -3.4}, {"code": "PT", "lat": 39.3, "lon": -8.2}];

const room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[0] });

const scoreLimitClassic = 3;
const scoreLimitBig = 3;
const timeLimitClassic = 3;
const timeLimitBig = 3;

room.setTeamsLock(true);

var adminPassword = 100 + getRandomInt(900);
console.log("adminPassword : " + adminPassword);

/* STADIUM */

const playerRadius = 15;
var ballRadius = 10;
const triggerDistance = playerRadius + ballRadius + 0.01;
var aloneMap = '{"name":"Classic NO GOAL from HaxMaps","width":420,"height":200,"spawnDistance":170,"bg":{"type":"grass","width":370,"height":170,"kickOffRadius":75,"cornerRadius":0},"vertexes":[{"x":-370,"y":170,"trait":"ballArea"},{"x":-370,"y":64,"trait":"ballArea"},{"x":-370,"y":-64,"trait":"ballArea"},{"x":-370,"y":-170,"trait":"ballArea"},{"x":370,"y":170,"trait":"ballArea"},{"x":370,"y":64,"trait":"ballArea"},{"x":370,"y":-64,"trait":"ballArea"},{"x":370,"y":-170,"trait":"ballArea"},{"x":0,"y":200,"trait":"kickOffBarrier"},{"x":0,"y":75,"trait":"kickOffBarrier"},{"x":0,"y":-75,"trait":"kickOffBarrier"},{"x":0,"y":-200,"trait":"kickOffBarrier"},{"x":-380,"y":-64,"trait":"goalNet"},{"x":-400,"y":-44,"trait":"goalNet"},{"x":-400,"y":44,"trait":"goalNet"},{"x":-380,"y":64,"trait":"goalNet"},{"x":380,"y":-64,"trait":"goalNet"},{"x":400,"y":-44,"trait":"goalNet"},{"x":400,"y":44,"trait":"goalNet"},{"x":380,"y":64,"trait":"goalNet"}],"segments":[{"v0":0,"v1":1,"trait":"ballArea"},{"v0":2,"v1":3,"trait":"ballArea"},{"v0":4,"v1":5,"trait":"ballArea"},{"v0":6,"v1":7,"trait":"ballArea"},{"v0":12,"v1":13,"trait":"goalNet","curve":-90},{"v0":13,"v1":14,"trait":"goalNet"},{"v0":14,"v1":15,"trait":"goalNet","curve":-90},{"v0":16,"v1":17,"trait":"goalNet","curve":90},{"v0":17,"v1":18,"trait":"goalNet"},{"v0":18,"v1":19,"trait":"goalNet","curve":90},{"v0":8,"v1":9,"trait":"kickOffBarrier"},{"v0":9,"v1":10,"trait":"kickOffBarrier","curve":180,"cGroup":["blueKO"]},{"v0":9,"v1":10,"trait":"kickOffBarrier","curve":-180,"cGroup":["redKO"]},{"v0":10,"v1":11,"trait":"kickOffBarrier"}],"goals":[],"discs":[{"pos":[-370,64],"trait":"goalPost","color":"FFCCCC"},{"pos":[-370,-64],"trait":"goalPost","color":"FFCCCC"},{"pos":[370,64],"trait":"goalPost","color":"CCCCFF"},{"pos":[370,-64],"trait":"goalPost","color":"CCCCFF"}],"planes":[{"normal":[0,1],"dist":-170,"trait":"ballArea"},{"normal":[0,-1],"dist":-170,"trait":"ballArea"},{"normal":[0,1],"dist":-200,"bCoef":0.1},{"normal":[0,-1],"dist":-200,"bCoef":0.1},{"normal":[1,0],"dist":-420,"bCoef":0.1},{"normal":[-1,0],"dist":-420,"bCoef":0.1}],"traits":{"ballArea":{"vis":false,"bCoef":1,"cMask":["ball"]},"goalPost":{"radius":8,"invMass":0,"bCoef":0.5},"goalNet":{"vis":true,"bCoef":0.1,"cMask":["ball"]},"kickOffBarrier":{"vis":false,"bCoef":0.1,"cGroup":["redKO","blueKO"],"cMask":["red","blue"]}}}'
var classicMap = ''; // Insert your map for 1v1 and 2v2 here. To get minimum file size, here are the instructions : 1. Download the map 2. Go to https://cssminifier.com 3. Paste the result
var bigMap = '.'; // Read above

/* OPTIONS */

var afkLimit = 12;
var drawTimeLimit = Infinity;
var maxTeamSize = 4; // This works for 1 (you might want to adapt things to remove some useless stats in 1v1 like assist or cs), 2, 3 or 4
var slowMode = 0;

/* PLAYERS */

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };
var extendedP = [];
const eP = { ID: 0, AUTH: 1, CONN: 2, AFK: 3, ACT: 4, GK: 5, MUTE: 6 };
var players;
var teamR;
var teamB;
var teamS;

/* GAME */

var lastTeamTouched;
var lastPlayersTouched; // These allow to get good goal notifications (it should be lastPlayersKicked, waiting on a next update to get better track of shots on target)
var countAFK = false; // Created to get better track of activity
var activePlay = false; // Created to get better track of the possession
var goldenGoal = false;
var SMSet = new Set(); // Set created to get slow mode which is useful in chooseMode
var banList = []; // Getting track of the bans, so we can unban ppl if we want

/* STATS */

var game;
var GKList = ["",""];
var Rposs = 0;
var Bposs = 0;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}]; // created to get ball speed
var ballSpeed;
var lastWinner = Team.SPECTATORS;
var streak = 0;
var allBlues = []; // This is to count the players who should be counted for the stats. This includes players who left after the game has started, doesn't include those who came too late or ...
var allReds = []; // ... those who came in a very unequal game.

/* BALANCE & CHOOSE */

var inChooseMode = false; // This variable enables to distinguish the 2 phases of playing and choosing which should be dealt with very differently
var redCaptainChoice = "";
var blueCaptainChoice = "";
var chooseTime = 20;
var timeOutCap;

/* AUXILIARY */

var checkTimeVariable = false; // This is created so the chat doesn't get spammed when a game is ending via timeLimit
var statNumber = 0; // This allows the room to be given stat information every X minutes
var endGameVariable = false; // This variable with the one below helps distinguish the cases where games are stopped because they have finished to the ones where games are stopped due to player movements or resetting teams
var resettingTeams = false;
var capLeft = false;
var statInterval = 6;

loadMap(aloneMap, 0, 0);

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

function getRandomInt(max) { // returns a random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function getTime(scores) { // returns the current time of the game
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
				room.setPlayerTeam(teamS[0].id, Team.RED);
				room.setPlayerTeam(teamS[1].id, Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[0].id, Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[0].id, Team.BLUE);
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
				room.setPlayerTeam(teamS[r].id, Team.RED);
				teamS = teamS.filter((spec) => spec.id != teamS[r].id);
				room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.BLUE);
		}
	}
}

function blueToSpecBtn() {
	resettingTeams = true;
	setTimeout(() => { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
	}
}

function redToSpecBtn() {
	resettingTeams = true;
	setTimeout(() => { resettingTeams = false; }, 100);
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
	}
}

function resetBtn() {
	resettingTeams = true;
	setTimeout(() => { resettingTeams = false; }, 100);
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

function blueToRedBtn() {
	resettingTeams = true;
	setTimeout(() => { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[i].id, Team.RED);
	}
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	game.scores = scores;
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01 && scores.timeLimit != 0) {
		if (scores.red != scores.blue) {
			if (checkTimeVariable == false) {
				checkTimeVariable = true;
				setTimeout(() => { checkTimeVariable = false; }, 3000);
				scores.red > scores.blue ? endGame(Team.RED) : endGame(Team.BLUE);
				setTimeout(() => { room.stopGame(); }, 2000);
			}
			return;
		}
		goldenGoal = true;
		room.sendChat("⚽ First goal wins! ⚽");
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			room.sendChat("⌛ 60 seconds left until draw! ⌛");
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			endGame(Team.SPECTATORS);
			room.stopGame();
			goldenGoal = false;
		}
	}
}

function endGame(winner) { // handles the end of a game : no stopGame function inside
	players.length >= 2 * maxTeamSize - 1 ? activateChooseMode() : null;
	const scores = room.getScores();
	game.scores = scores;
	Rposs = Rposs/(Rposs+Bposs);
	Bposs = 1 - Rposs;
	lastWinner = winner;
	endGameVariable = true;
	if (winner == Team.RED) {
		streak++;
		room.sendChat("🔴 Red Team won " + scores.red + "-" + scores.blue + " ! Current streak : " + streak + " 🏆");
	}
	else if (winner == Team.BLUE) {
		streak = 1;
		room.sendChat("🔵 Blue Team won " + scores.blue + "-" + scores.red + " ! Current streak : " + streak + " 🏆");
	}
	else {
		streak = 0;
		room.sendChat("💤 Draw limit reached! 💤");
    }
    room.sendChat("⭐ Possession : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵");
    scores.red == 0 ? (scores.blue == 0 ? room.sendChat("🏆 " + GKList[0].name + " and " + GKList[1].name + " kept a CS ! ") : room.sendChat("🏆 " + GKList[1].name + " kept a CS ! ")) : scores.blue == 0 ? room.sendChat("🏆 " + GKList[0].name + " kept a CS ! ") : null;
	updateStats();
}

function quickRestart() {
	room.stopGame();
	setTimeout(() => { room.startGame(); }, 2000);
}

function resumeGame() {
	setTimeout(() => { room.startGame(); }, 2000);
	setTimeout(() => { room.pauseGame(false); }, 1000);
}

function activateChooseMode() {
	inChooseMode = true;
	slowMode = 2;
	room.sendChat("2 seconds slow mode enabled !");
}

function deactivateChooseMode() {
	inChooseMode = false;
	clearTimeout(timeOutCap);
	if (slowMode != 0) {
		slowMode = 0;
		room.sendChat("Slow mode terminated.");
	}
	redCaptainChoice = "";
	blueCaptainChoice = "";
}

function loadMap(map, scoreLim, timeLim) {
	if (map == aloneMap) {
		room.setCustomStadium(aloneMap);
	}
	else if (map == classicMap) {
		(classicMap != '') ? room.setCustomStadium(classicMap) : room.setDefaultStadium("Classic");
	}
	else if (map == bigMap) {
		(bigMap != '.') ? room.setCustomStadium(bigMap) : room.setDefaultStadium("Big");
	}
	else {
		room.setCustomStadium(map);
	}
	room.setScoreLimit(scoreLim);
	room.setTimeLimit(timeLim);
}

/* PLAYER FUNCTIONS */

function updateTeams() { // update the players' list and all the teams' list
	players = room.getPlayerList().filter((player) => player.id != 0 && !getAFK(player));
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}

function handleInactivity() { // handles inactivity : players will be kicked after afkLimit
	if (countAFK && (teamR.length + teamB.length) > 1) {
		for (var i = 0; i < teamR.length ; i++) {
			setActivity(teamR[i], getActivity(teamR[i]) + 1);
		}
		for (var i = 0; i < teamB.length ; i++) {
			setActivity(teamB[i], getActivity(teamB[i]) + 1);
		}
	}
	for (var i = 0; i < extendedP.length ; i++) {
		if (extendedP[i][eP.ACT] == 60 * (2/3 * afkLimit)) {
			room.sendChat("[PV] ⛔ If you don't move or send a message in the next 4 seconds, you will be kicked !", extendedP[i][eP.ID]);
		}
		if (extendedP[i][eP.ACT] >= 60 * afkLimit) {
			extendedP[i][eP.ACT] = 0;
            if (room.getScores().time <= afkLimit - 0.5) {
				setTimeout(() => { !inChooseMode ? quickRestart() : room.stopGame(); }, 10);
			}
			room.kickPlayer(extendedP[i][eP.ID], "AFK", false);
		}
	}
}

function getAuth(player) {
	return extendedP.filter((a) => a[0] == player.id) != null ? extendedP.filter((a) => a[0] == player.id)[0][eP.AUTH] : null;
}

function getAFK(player) {
	return extendedP.filter((a) => a[0] == player.id) != null ? extendedP.filter((a) => a[0] == player.id)[0][eP.AFK] : null;
}

function setAFK(player, value) {
	extendedP.filter((a) => a[0] == player.id).forEach((player) => player[eP.AFK] = value);
}

function getActivity(player) {
	return extendedP.filter((a) => a[0] == player.id) != null ? extendedP.filter((a) => a[0] == player.id)[0][eP.ACT] : null;
}

function setActivity(player, value) {
	extendedP.filter((a) => a[0] == player.id).forEach((player) => player[eP.ACT] = value);
}

function getGK(player) {
	return extendedP.filter((a) => a[0] == player.id) != null ? extendedP.filter((a) => a[0] == player.id)[0][eP.GK] : null;
}

function setGK(player, value) {
	extendedP.filter((a) => a[0] == player.id).forEach((player) => player[eP.GK] = value);
}

function getMute(player) {
	return extendedP.filter((a) => a[0] == player.id) != null ? extendedP.filter((a) => a[0] == player.id)[0][eP.MUTE] : null;
}

function setMute(player, value) {
	extendedP.filter((a) => a[0] == player.id).forEach((player) => player[eP.MUTE] = value);
}

/* BALANCE & CHOOSE FUNCTIONS */

function updateRoleOnPlayerIn() {
	updateTeams();
	if (inChooseMode) {
		if (players.length == 6) {
			loadMap(bigMap, scoreLimitBig, timeLimitBig);
		}
		getSpecList(teamR.length <= teamB.length ? teamR[0] : teamB[0]);
	}
	balanceTeams();
}

function updateRoleOnPlayerOut() {
    updateTeams();
	if (room.getScores() != null) {
		var scores = room.getScores();
		if (players.length >= 2 * maxTeamSize && scores.time >= (5/6) * game.scores.timeLimit && teamR.length != teamB.length) {
			if (teamR.length < teamB.length) {
				if (scores.blue - scores.red == 2) {
					endGame(Team.BLUE);
					room.sendChat("🤖 Ragequit detected. Game ended 🤖");
					setTimeout(() => { room.stopGame(); }, 110);
					return;
				}
			}
			else {
				if (scores.red - scores.blue == 2) {
					endGame(Team.RED);
					room.sendChat("🤖 Ragequit detected. Game ended 🤖");
					setTimeout(() => { room.stopGame(); }, 110);
					return;
				}
			}
		}
	}
	if (inChooseMode) {
		if (players.length == 5) {
			loadMap(classicMap, scoreLimitClassic, timeLimitClassic);
		}
		if (teamR.length == 0 || teamB.length == 0) {
			teamR.length == 0 ? room.setPlayerTeam(teamS[0].id, Team.RED) : room.setPlayerTeam(teamS[0].id, Team.BLUE);
			return;
		}
		if (Math.abs(teamR.length - teamB.length) == teamS.length) {
			room.sendChat("🤖 No choices left, let me handle this situation... 🤖");
			deactivateChooseMode();
			resumeGame();
			var b = teamS.length;
			if (teamR.length > teamB.length) {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(() => { room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 5*i);
				}
			}
			else {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(() => { room.setPlayerTeam(teamS[0].id, Team.RED); }, 5*i);
				}
			}
			return;
		}
		if (streak == 0 && room.getScores() == null) {
			if (Math.abs(teamR.length - teamB.length) == 2) { // if someone left a team has 2 more players than the other one, put the last chosen guy back in his place so it's fair
				room.sendChat("🤖 Balancing teams... 🤖");
				teamR.length > teamB.length ? room.setPlayerTeam(teamR[teamR.length - 1].id, Team.SPECTATORS) : room.setPlayerTeam(teamB[teamB.length - 1].id, Team.SPECTATORS);
			}
		}
		if (teamR.length == teamB.length && teamS.length < 2) {
			deactivateChooseMode();
			resumeGame();
			return;
		}
		capLeft ? choosePlayer() : getSpecList(teamR.length <= teamB.length ? teamR[0] : teamB[0]);
	}
	balanceTeams();
}

function balanceTeams() {
	if (!inChooseMode) {
		if (players.length == 1 && teamR.length == 0) {
            quickRestart();
            loadMap(aloneMap, 0, 0);
			room.setPlayerTeam(players[0].id, Team.RED);
		}
		else if (Math.abs(teamR.length - teamB.length) == teamS.length && teamS.length > 0) {
			const n = Math.abs(teamR.length - teamB.length);
			if (players.length == 2) {
				quickRestart();
				loadMap(classicMap, scoreLimitClassic, timeLimitClassic);
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
				quickRestart();
				loadMap(aloneMap, 0, 0);
				room.setPlayerTeam(players[0].id, Team.RED);
				return;
			}
			else if (players.length == 5) {
				quickRestart();
				loadMap(classicMap, scoreLimitClassic, timeLimitClassic);
			}
			if (players.length == maxTeamSize * 2 - 1) {
				allReds = [];
				allBlues = [];
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
			activateChooseMode();
			choosePlayer();
		}
		else if (teamS.length >= 2 && teamR.length == teamB.length && teamR.length < maxTeamSize) {
			if (teamR.length == 2) {
				quickRestart();
				loadMap(bigMap, scoreLimitBig, timeLimitBig);
			}
			topBtn();
		}
	}
}

function choosePlayer() {
	clearTimeout(timeOutCap);
	if (teamR.length <= teamB.length && teamR.length != 0) {
		room.sendChat("[PV] To choose a player, enter his number in the list given or use 'top', 'random' or 'bottom'.", teamR[0].id);
		timeOutCap = setTimeout(function(player) { room.sendChat("[PV] Hurry up " + player.name + ", only " + Number.parseInt(chooseTime/2) + " seconds left to choose !", player.id); timeOutCap = setTimeout(function(player) { room.kickPlayer(player.id, "You didn't choose in time !", false);}, chooseTime * 500, teamR[0]); }, chooseTime * 1000, teamR[0]);
	}
	else if (teamB.length < teamR.length && teamB.length != 0) {
		room.sendChat("[PV] To choose a player, enter his number in the list given or use 'top', 'random' or 'bottom'.", teamB[0].id);
		timeOutCap = setTimeout(function(player) { room.sendChat("[PV] Hurry up " + player.name + ", only " + Number.parseInt(chooseTime/2) + " seconds left to choose !", player.id); timeOutCap = setTimeout(function(player) { room.kickPlayer(player.id, "You didn't choose in time !", false);}, chooseTime * 500, teamB[0]); }, chooseTime * 1000, teamB[0]);
	}
	getSpecList(teamR.length <= teamB.length ? teamR[0] : teamB[0]);
}

function getSpecList(player) {
	var cstm = "[PV] Players : ";
	for (var i = 0 ; i < teamS.length ; i++) {
		if (140 - cstm.length < (teamS[i].name + "[" + (i+1) + "], ").length) {
			room.sendChat(cstm, player.id);
			cstm = "... ";
		}
		cstm += teamS[i].name + "[" + (i+1) + "], ";
	}
	cstm = cstm.substring(0,cstm.length - 2);
	cstm += ".";
	room.sendChat(cstm, player.id);
}

/* STATS FUNCTIONS */

function getLastTouchOfTheBall() {
	const ballPosition = room.getBallPosition();
	updateTeams();
	for (var i = 0; i < players.length; i++) {
		if (players[i].position != null) {
			var distanceToBall = pointDistance(players[i].position, ballPosition);
			if (distanceToBall < triggerDistance) {
				!activePlay ? activePlay = true : null;
				lastTeamTouched = players[i].team;
			}
		}
	}
}

function getStats() { // gives possession, ball speed and GK of each team
	if (activePlay) {
		updateTeams();
		lastTeamTouched == Team.RED ? Rposs++ : Bposs++;
		var ballPosition = room.getBallPosition();
		point[1] = point[0];
		point[0] = ballPosition;
		ballSpeed = (pointDistance(point[0], point[1]) * 60 * 60 * 60)/15000;
		var k = [-1, Infinity];
		for (var i = 0; i < teamR.length; i++) {
			if (teamR[i].position.x < k[1]) {
				k[0] = teamR[i];
				k[1] = teamR[i].position.x;
			}
		}
		k[0] != -1 ? setGK(k[0], getGK(k[0]) + 1) : null;
		k = [-1, -Infinity];
		for (var i = 0; i < teamB.length; i++) {
			if (teamB[i].position.x > k[1]) {
				k[0] = teamB[i];
				k[1] = teamB[i].position.x;
			}
		}
		k[0] != -1 ? setGK(k[0], getGK(k[0]) + 1) : null;
		findGK();
	}
}

function updateStats() {
	if (players.length >= 2 * maxTeamSize && (game.scores.time >= (5/6) * game.scores.timeLimit || game.scores.red == game.scores.scoreLimit || game.scores.blue == game.scores.scoreLimit) && allReds.length >= maxTeamSize && allBlues.length >= maxTeamSize) {
		var stats;
		for (var i = 0; i < allReds.length ; i++) {
			localStorage.getItem(getAuth(allReds[i])) ? stats = JSON.parse(localStorage.getItem(getAuth(allReds[i]))) : stats = [0, 0, 0, 0, "0.00", 0, 0, 0, 0, "0.00", allReds[i].name];
			stats[0]++;
			lastWinner == Team.RED ? stats[1]++ : lastWinner == Team.BLUE ? stats[3]++ : stats[2]++;
			stats[4] = (100 * stats[1]/stats[0]).toPrecision(3);
			localStorage.setItem(getAuth(allReds[i]), JSON.stringify(stats));
		}
		for (var i = 0; i < allBlues.length ; i++) {
			localStorage.getItem(getAuth(allBlues[i])) ? stats = JSON.parse(localStorage.getItem(getAuth(allBlues[i]))) : stats = [0, 0, 0, 0, "0.00", 0, 0, 0, 0, "0.00", allBlues[i].name];
			stats[0]++;
			lastWinner == Team.BLUE ? stats[1]++ : lastWinner == Team.RED ? stats[3]++ : stats[2]++;
			stats[4] = (100 * stats[1]/stats[0]).toPrecision(3);
			localStorage.setItem(getAuth(allBlues[i]), JSON.stringify(stats));
		}
		for (var i = 0; i < game.goals.length ; i++) {
            if (game.goals[i].striker != null) {
                if ((allBlues.concat(allReds)).findIndex((player) => player.id == game.goals[i].striker.id) != -1) {
                    stats = JSON.parse(localStorage.getItem(getAuth(game.goals[i].striker)));
                    stats[5]++;
                    localStorage.setItem(getAuth(game.goals[i].striker), JSON.stringify(stats));
                }
            }
            if (game.goals[i].assist != null) {
                if ((allBlues.concat(allReds)).findIndex((player) => player.name == game.goals[i].assist.name) != -1) {
                    stats = JSON.parse(localStorage.getItem(getAuth(game.goals[i].assist)));
                    stats[6]++;
                    localStorage.setItem(getAuth(game.goals[i].assist), JSON.stringify(stats));
                }
            }
		}
		if (allReds.findIndex((player) => player.id == GKList[0].id) != -1) {
			stats = JSON.parse(localStorage.getItem(getAuth(GKList[0])));
			stats[7]++;
			game.scores.blue == 0 ? stats[8]++ : null;
			stats[9] = (100 * stats[8]/stats[7]).toPrecision(3);
			localStorage.setItem(getAuth(GKList[0]), JSON.stringify(stats));
		}
		if (allBlues.findIndex((player) => player.id == GKList[1].id) != -1) {
			stats = JSON.parse(localStorage.getItem(getAuth(GKList[1])));
			stats[7]++;
			game.scores.red == 0 ? stats[8]++ : null;
			stats[9] = (100 * stats[8]/stats[7]).toPrecision(3);
			localStorage.setItem(getAuth(GKList[1]), JSON.stringify(stats));
		}
	}
}

function findGK() {
	var tab = [[-1,""], [-1,""]];
	for (var i = 0; i < extendedP.length ; i++) {
		if (room.getPlayer(extendedP[i][eP.ID]) != null && room.getPlayer(extendedP[i][eP.ID]).team == Team.RED) {
			if (tab[0][0] < extendedP[i][eP.GK]) {
				tab[0][0] = extendedP[i][eP.GK];
				tab[0][1] = room.getPlayer(extendedP[i][eP.ID]);
			}
		}
		else if (room.getPlayer(extendedP[i][eP.ID]) != null && room.getPlayer(extendedP[i][eP.ID]).team == Team.BLUE) {
			if (tab[1][0] < extendedP[i][eP.GK]) {
				tab[1][0] = extendedP[i][eP.GK];
				tab[1][1] = room.getPlayer(extendedP[i][eP.ID]);
			}
		}
	}
	GKList = [tab[0][1], tab[1][1]];
}

setInterval(() => {
	var tableau = [];
	if (statNumber % 5 == 0) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[0])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Games> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (statNumber % 5 == 1) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[1])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	if (statNumber % 5 == 2) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[5])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (statNumber % 5 == 3) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[6])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (statNumber % 5 == 4) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[8])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("CS> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	statNumber++;
}, statInterval * 60 * 1000);

/* EVENTS */

/* PLAYER MOVEMENT */

room.onPlayerJoin = function(player) {
	extendedP.push([player.id, player.auth, player.conn, false, 0, 0, false]);
	updateRoleOnPlayerIn();
	room.sendChat("[PV] 👋 Welcome " + player.name + " ! Type '!help' to see the commands.", player.id);
	if (localStorage.getItem(player.auth) != null && JSON.parse(localStorage.getItem(player.auth)).length == 12) {
		room.sendChat(player.name + " automatically logged in !");
	}
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	if (changedPlayer.id == 0) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		return;
	}
	if (getAFK(changedPlayer) && changedPlayer.team != Team.SPECTATORS) {
		room.setPlayerTeam(changedPlayer.id, Team.SPECTATORS);
		room.sendChat(changedPlayer.name + " is AFK !");
		return;
	}
	updateTeams();
	if (room.getScores() != null) {
		var scores = room.getScores();
		if (changedPlayer.team != Team.SPECTATORS && scores.time <= (3/4) * scores.timeLimit  && Math.abs(scores.blue - scores.red) < 2) {
			(changedPlayer.team == Team.RED) ? allReds.push(changedPlayer) : allBlues.push(changedPlayer);
		}
	}
	if (changedPlayer.team == Team.SPECTATORS) {
		setActivity(changedPlayer, 0);
	}
	if (inChooseMode && resettingTeams == false && byPlayer.id == 0) {
		if (Math.abs(teamR.length - teamB.length) == teamS.length) {
			deactivateChooseMode();
			resumeGame();
			var b = teamS.length;
			if (teamR.length > teamB.length) {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(() => { room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 500*i);
				}
			}
			else {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(() => { room.setPlayerTeam(teamS[0].id, Team.RED); }, 200*i);
				}
			}
			return;
		}
		else if ((teamR.length == maxTeamSize && teamB.length == maxTeamSize) || (teamR.length == teamB.length && teamS.length < 2)) {
			deactivateChooseMode();
			resumeGame();
		}
		else if (teamR.length <= teamB.length && redCaptainChoice != "") { // choice remembered
			redCaptainChoice == "top" ? room.setPlayerTeam(teamS[0].id, Team.RED) : redCaptainChoice == "random" ? room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.RED) : room.setPlayerTeam(teamS[teamS.length - 1].id, Team.RED);
			return;
		}
		else if (teamB.length < teamR.length && blueCaptainChoice != "") {
			blueCaptainChoice == "top" ? room.setPlayerTeam(teamS[0].id, Team.BLUE) : blueCaptainChoice == "random" ? room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.BLUE) : room.setPlayerTeam(teamS[teamS.length - 1].id, Team.BLUE);
			return;
		}
		else {
			choosePlayer();
		}
	}
}

room.onPlayerLeave = function(player) {
	if (teamR.findIndex((red) => red.id == player.id) == 0 && inChooseMode && teamR.length <= teamB.length) {
		choosePlayer();
		capLeft = true; setTimeout(() => { capLeft = false; }, 10);
	}
	if (teamB.findIndex((blue) => blue.id == player.id) == 0 && inChooseMode && teamB.length < teamR.length) {
		choosePlayer();
		capLeft = true; setTimeout(() => { capLeft = false; }, 10);
	}
	setActivity(player, 0);
    updateRoleOnPlayerOut();
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
	ban == true ? banList.push([kickedPlayer.name, kickedPlayer.id]) : null;
}

/* PLAYER ACTIVITY */

room.onPlayerChat = function (player, message) {
	message = message.split(" ");
	player.team != Team.SPECTATORS ? setActivity(player, 0) : null;
	if (["!help"].includes(message[0].toLowerCase())) {
		room.sendChat("[PV] Player commands : !register <pw>, !me, !games, !wins, !goals, !assists, !cs, !afks, !mutes, !bans . PW must be > 4 characters.", player.id);
		player.admin ? room.sendChat("[PV] Admin : !mute <duration = 3> #<id>, !unmute all/#<id>, !clearbans <number = all>, !slow <duration>, !endslow", player.id) : null;
	}
	else if (["!afk"].includes(message[0].toLowerCase())) {
		if (players.length != 1 && player.team != Team.SPECTATORS) {
			room.sendChat("You can't go AFK while you're in a team !", player.id);
			return false;
		}
		if (players.length == 1 && !getAFK(player)) {
			room.setPlayerTeam(player.id, Team.SPECTATORS);
		}
		setAFK(player, !getAFK(player));
		room.sendChat(player.name + (getAFK(player) ? " is now AFK !" : " is not AFK anymore !"));
		getAFK(player) ? updateRoleOnPlayerOut() : updateRoleOnPlayerIn();
	}
	else if (["!afks", "!afklist"].includes(message[0].toLowerCase())) {
		var cstm = "[PV] AFK List : ";
		for (var i = 0; i < extendedP.length; i++) {
			if (room.getPlayer(extendedP[i][eP.ID]) != null && getAFK(room.getPlayer(extendedP[i][eP.ID]))) {
				if (140 - cstm.length < (room.getPlayer(extendedP[i][eP.ID]).name + ", ").length) {
					room.sendChat(cstm, player.id);
					cstm = "... ";
				}
				cstm += room.getPlayer(extendedP[i][eP.ID]).name + ", ";
			}
		}
		if (cstm == "[PV] AFK List : ") {
			room.sendChat("[PV] There's nobody in the AFK List !", player.id);
			return false;
		}
		cstm = cstm.substring(0, cstm.length - 2);
		cstm += ".";
		room.sendChat(cstm, player.id);
	}
	else if (["!register"].includes(message[0].toLowerCase())) {
		if (JSON.parse(localStorage.getItem(getAuth(player))) == undefined || JSON.parse(localStorage.getItem(getAuth(player)))[11] == undefined) {
			if (message.length == 2) {
				if (message[1].length < 4) {
					room.sendChat("[PV] Your password should be over 4 characters ! Please try again.", player.id)
					return false;
				}
				room.sendChat(player.name + " successfully registered and logged in !");
				var stats;
				localStorage.getItem(getAuth(player)) ? stats = JSON.parse(localStorage.getItem(getAuth(player))) : stats = [0, 0, 0, 0, "0.00", 0, 0, 0, 0, "0.00", player.name];
				stats.push(message[1]);
				localStorage.setItem(getAuth(player), JSON.stringify(stats));
				return false;
			}
		}
		JSON.parse(localStorage.getItem(getAuth(player)))[11] != undefined ? room.sendChat("[PV] You already registered ! Contact admin to get your password back", player.id) : null;
	}
	else if (["!me"].includes(message[0].toLowerCase())) {
		var stats;
		localStorage.getItem(getAuth(player)) ? stats = JSON.parse(localStorage.getItem(getAuth(player))) : stats = [0, 0, 0, 0, "0.00", 0, 0, 0, 0, "0.00"];
		room.sendChat("[PV] " + player.name + "> Game: " + stats[0] + ", Win: " + stats[1] + ", Draw: " + stats[2] + ", Loss: " + stats[3] + ", WR: " + stats[4] + "%, Goal: " + stats[5] + ", Assist: " + stats[6] + ", GK: " + stats[7] + ", CS: " + stats[8] + ", CS%: " + stats[9] + "%", player.id);
	}
	else if (["!games"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function (key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]), (JSON.parse(localStorage.getItem(key))[0])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function (a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Games> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!wins"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function (key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]), (JSON.parse(localStorage.getItem(key))[1])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function (a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!goals"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function (key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]), (JSON.parse(localStorage.getItem(key))[5])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function (a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!assists"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function (key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]), (JSON.parse(localStorage.getItem(key))[6])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function (a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!cs"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function (key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]), (JSON.parse(localStorage.getItem(key))[8])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function (a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] CS> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!claim"].includes(message[0].toLowerCase())) {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
			adminPassword = 100 + getRandomInt(900);
			console.log("adminPassword : " + adminPassword);
		}
	}
	else if (["!mutes", "!mutelist"].includes(message[0].toLowerCase())) {
		var cstm = "[PV] Mute List : ";
		for (var i = 0; i < extendedP.length; i++) {
			if (room.getPlayer(extendedP[i][eP.ID]) != null && getMute(room.getPlayer(extendedP[i][eP.ID]))) {
				if (140 - cstm.length < (room.getPlayer(extendedP[i][eP.ID]).name + "[" + (extendedP[i][eP.ID]) + "], ").length) {
					room.sendChat(cstm, player.id);
					cstm = "... ";
				}
				cstm += room.getPlayer(extendedP[i][eP.ID]).name + "[" + (extendedP[i][eP.ID]) + "], ";
			}
		}
		if (cstm == "[PV] Mute List : ") {
			room.sendChat("[PV] There's nobody in the Mute List !", player.id);
			return false;
		}
		cstm = cstm.substring(0, cstm.length - 2);
		cstm += ".";
		room.sendChat(cstm, player.id);
	}
	else if (["!mute"].includes(message[0].toLowerCase())) {
		if (player.admin) {
			updateTeams();
			var timeOut;
			if (!Number.isNaN(Number.parseInt(message[1])) && message.length > 1) {
				if (Number.parseInt(message[1]) > 0) {
					timeOut = Number.parseInt(message[1]) * 60 * 1000;
				}
				else {
					timeOut = 3 * 60 * 1000;
				}
				if (message[2].length > 1 && message[2][0] == "#") {
					message[2] = message[2].substring(1, message[2].length);
					if (!Number.isNaN(Number.parseInt(message[2])) && room.getPlayer(Number.parseInt(message[2])) != null) {
						if (room.getPlayer(Number.parseInt(message[2])).admin || getMute(room.getPlayer(Number.parseInt(message[2])))) {
							return false;
						}
						setTimeout(function (player) { setMute(player, false); }, timeOut, room.getPlayer(Number.parseInt(message[2])));
						setMute(room.getPlayer(Number.parseInt(message[2])), true);
						room.sendChat(room.getPlayer(Number.parseInt(message[2])).name + " has been muted for " + (timeOut / 60000) + " minutes!");
					}
				}
			}
			else if (Number.isNaN(Number.parseInt(message[1]))) {
				if (message[1].length > 1 && message[1][0] == "#") {
					message[1] = message[1].substring(1, message[1].length);
					if (!Number.isNaN(Number.parseInt(message[1])) && room.getPlayer(Number.parseInt(message[1])) != null) {
						if (room.getPlayer(Number.parseInt(message[1])).admin || getMute(room.getPlayer(Number.parseInt(message[1])))) {
							return false;
						}
						setTimeout(function (player) { setMute(player, false); }, 3 * 60 * 1000, room.getPlayer(Number.parseInt(message[1])));
						setMute(room.getPlayer(Number.parseInt(message[1])), true);
						room.sendChat(room.getPlayer(Number.parseInt(message[1])).name + " has been muted for 3 minutes!");
					}
				}
			}
		}
	}
	else if (["!unmute"].includes(message[0].toLowerCase())) {
		if (player.admin && message.length >= 2) {
			if (message[1] == "all") {
				extendedP.forEach((ePlayer) => { ePlayer[eP.MUTE] = false; });
				room.sendChat("Mutes cleared.");
			}
			else if (!Number.isNaN(Number.parseInt(message[1])) && room.getPlayer(Number.parseInt(message[1])) != null && getMute(room.getPlayer(Number.parseInt(message[1])))) {
				setMute(room.getPlayer(Number.parseInt(message[1])), false);
				room.sendChat(room.getPlayer(Number.parseInt(message[1])).name + " has been unmuted !");
			}
			else if (Number.isNaN(Number.parseInt(message[1]))) {
				if (message[1].length > 1 && message[1][0] == "#") {
					message[1] = message[1].substring(1, message[1].length);
					if (!Number.isNaN(Number.parseInt(message[1])) && room.getPlayer(Number.parseInt(message[1])) != null && getMute(room.getPlayer(Number.parseInt(message[1])))) {
						setMute(room.getPlayer(Number.parseInt(message[1])), false);
						room.sendChat(room.getPlayer(Number.parseInt(message[1])).name + " has been unmuted !");
					}
				}
			}
		}
	}
	else if (["!slow"].includes(message[0].toLowerCase())) {
		if (player.admin) {
			if (message.length == 1) {
				slowMode = 2;
				room.sendChat("2 seconds slow mode enabled !");
			}
			else if (message.length == 2) {
				if (!Number.isNaN(Number.parseInt(message[1]))) {
					if (Number.parseInt(message[1]) > 0) {
						slowMode = Number.parseInt(message[1]);
						room.sendChat(slowMode + " seconds slow mode enabled !");
						return false;
					}
				}
				slowMode = 2;
				room.sendChat("2 seconds slow mode enabled !");
			}
		}
	}
	else if (["!endslow"].includes(message[0].toLowerCase())) {
		if (player.admin) {
			slowMode != 0 ? room.sendChat("Slow mode terminated.") : null;
			slowMode = 0;
		}
	}
	else if (["!banlist", "!bans"].includes(message[0].toLowerCase())) {
		if (banList.length == 0) {
			room.sendChat("[PV] There's nobody in the Ban List !", player.id);
			return false;
		}
		var cstm = "[PV] Ban List : ";
		for (var i = 0; i < banList.length; i++) {
			if (140 - cstm.length < (banList[i][0] + "[" + (banList[i][1]) + "], ").length) {
				room.sendChat(cstm, player.id);
				cstm = "... ";
			}
			cstm += banList[i][0] + "[" + (banList[i][1]) + "], ";
		}
		cstm = cstm.substring(0, cstm.length - 2);
		cstm += ".";
		room.sendChat(cstm, player.id);
	}
	else if (["!clearbans"].includes(message[0].toLowerCase())) {
		if (player.admin) {
			if (message.length == 1) {
				room.clearBans();
				room.sendChat("Bans cleared !");
				banList = [];
			}
			if (message.length == 2) {
				if (!Number.isNaN(Number.parseInt(message[1]))) {
					if (Number.parseInt(message[1]) > 0) {
						ID = Number.parseInt(message[1]);
						room.clearBan(ID);
						if (banList.length != banList.filter((array) => array[1] != ID)) {
							room.sendChat(banList.filter((array) => array[1] == ID)[0][0] + " has been unbanned from the room !");
						}
						setTimeout(() => { banList = banList.filter((array) => array[1] != ID); }, 20);
					}
				}
			}
		}
	}
	else if (["!bb", "!bye", "!cya", "!gn"].includes(message[0].toLowerCase())) {
		room.kickPlayer(player.id, "Bye !", false);
	}
	if (teamR.length != 0 && teamB.length != 0 && inChooseMode) {
		if (player.id == teamR[0].id || player.id == teamB[0].id) { // we care if it's one of the captains choosing
			if (teamR.length <= teamB.length && player.id == teamR[0].id) { // we care if it's red turn && red cap talking
				if (message[0].toLowerCase() == "top" || message[0].toLowerCase() == "!top") {
					room.setPlayerTeam(teamS[0].id, Team.RED);
					redCaptainChoice = "top";
					clearTimeout(timeOutCap);
					room.sendChat(player.name + " chose Top !");
					return false;
				}
				else if (message[0].toLowerCase() == "random" || message[0].toLowerCase() == "!random") {
					var r = getRandomInt(teamS.length);
					room.setPlayerTeam(teamS[r].id, Team.RED);
					redCaptainChoice = "random";
					clearTimeout(timeOutCap);
					room.sendChat(player.name + " chose Random !");
					return false;
				}
				else if (message[0].toLowerCase() == "bottom" || message[0].toLowerCase() == "!bottom") {
					room.setPlayerTeam(teamS[teamS.length - 1].id, Team.RED);
					redCaptainChoice = "bottom";
					clearTimeout(timeOutCap);
					room.sendChat(player.name + " chose Bottom !");
					return false;
				}
				else if (message[0].toLowerCase() == "auto" || message[0].toLowerCase() == "!auto") {
					room.sendChat("[PV] Sorry, I don't know what you mean by 'auto'! Try again with 'top' or 'random' !", player.id);
					return false;
				}
				else if (!Number.isNaN(Number.parseInt(message[0]))) {
					if (Number.parseInt(message[0]) > teamS.length || Number.parseInt(message[0]) < 1) {
						room.sendChat("[PV] Your number is invalid !", player.id);
						return false;
					}
					else {
						room.setPlayerTeam(teamS[Number.parseInt(message[0]) - 1].id, Team.RED);
						room.sendChat(player.name + " chose " + teamS[Number.parseInt(message[0]) - 1].name + " !");
						return false;
					}
				}
			}
			if (teamR.length > teamB.length && player.id == teamB[0].id) { // we care if it's red turn && red cap talking
				if (message[0].toLowerCase() == "top" || message[0].toLowerCase() == "!top") {
					room.setPlayerTeam(teamS[0].id, Team.BLUE);
					blueCaptainChoice = "top";
					clearTimeout(timeOutCap);
					room.sendChat(player.name + " chose Top !");
					return false;
				}
				else if (message[0].toLowerCase() == "random" || message[0].toLowerCase() == "!random") {
					room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.BLUE);
					blueCaptainChoice = "random";
					clearTimeout(timeOutCap);
					room.sendChat(player.name + " chose Random !");
					return false;
				}
				else if (message[0].toLowerCase() == "bottom" || message[0].toLowerCase() == "!bottom") {
					room.setPlayerTeam(teamS[teamS.length - 1].id, Team.BLUE);
					blueCaptainChoice = "bottom";
					clearTimeout(timeOutCap);
					room.sendChat(player.name + " chose Bottom !");
					return false;
				}
				else if (message[0].toLowerCase() == "auto" || message[0].toLowerCase() == "!auto") {
					room.sendChat("[PV] Sorry, I don't know what you mean by 'auto'! Try again with 'top' or 'random' !", player.id);
					return false;
				}
				else if (!Number.isNaN(Number.parseInt(message[0]))) {
					if (Number.parseInt(message[0]) > teamS.length || Number.parseInt(message[0]) < 1) {
						room.sendChat("[PV] Your number is invalid !", player.id);
						return false;
					}
					else {
						room.setPlayerTeam(teamS[Number.parseInt(message[0]) - 1].id, Team.BLUE);
						room.sendChat(player.name + " chose " + teamS[Number.parseInt(message[0]) - 1].name + " !");
						return false;
					}
				}
			}
		}
	}
	if (message[0][0] == "!") {
		return false;
	}
	if (getMute(player)) {
		room.sendChat("You are muted.", player.id);
		return false;
	}
	if (slowMode > 0) {
		if (!player.admin) {
			if (!SMSet.has(player.id)) {
				SMSet.add(player.id);
				setTimeout((number) => { SMSet.delete(number); }, slowMode * 1000, player.id);
			}
			else {
				return false;
			}
		}
	}
}

room.onPlayerActivity = function(player) {
	setActivity(player, 0);
}

room.onPlayerBallKick = function(player) {
	if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
		!activePlay ? activePlay = true : null;
		lastTeamTouched = player.team;
		lastPlayersTouched[1] = lastPlayersTouched[0];
		lastPlayersTouched[0] = player;
	}
}

/* GAME MANAGEMENT */

room.onGameStart = function(byPlayer) {
	game = new Game(Date.now(), room.getScores(), []);
	countAFK = true;
	activePlay = false;
	goldenGoal = false;
	endGameVariable = false;
	lastPlayersTouched = [null, null];
    Rposs = 0;
	Bposs = 0;
	GKList = [];
	allReds = [];
	allBlues = [];
	if (teamR.length == maxTeamSize && teamB.length == maxTeamSize) {
		for (var i = 0; i < maxTeamSize; i++) {
			allReds.push(teamR[i]);
			allBlues.push(teamB[i]);
		}
	}
	for (var i = 0; i < extendedP.length; i++) {
		extendedP[i][eP.GK] = 0;
		extendedP[i][eP.ACT] = 0;
		room.getPlayer(extendedP[i][eP.ID]) == null ? extendedP.splice(i, 1) : null;
	}
	deactivateChooseMode();
}

room.onGameStop = function(byPlayer) {
	if (byPlayer.id == 0 && endGameVariable) {
		updateTeams();
		if (inChooseMode) {
			if (players.length == 2 * maxTeamSize) {
				inChooseMode = false;
				resetBtn();
				for (var i = 0; i < maxTeamSize; i++) {
					setTimeout(() => { randomBtn(); }, 499*i);
				}
				setTimeout(() => { room.startGame(); }, 2000);
			}
			else {
				if (lastWinner == Team.RED) {
					blueToSpecBtn();
				}
				else if (lastWinner == Team.BLUE) {
					redToSpecBtn();
					blueToRedBtn();
				}
				else {
					resetBtn();
				}
				setTimeout(() => { topBtn(); }, 500);
			}
		}
		else {
			if (players.length == 2) {
				if (lastWinner == Team.BLUE) {
					room.setPlayerTeam(teamB[0].id, Team.RED);
					room.setPlayerTeam(teamR[0].id, Team.BLUE);
				}
				setTimeout(() => { room.startGame(); }, 2000);
			}
			else if (players.length == 3 || players.length >= 2 * maxTeamSize + 1) {
				if (lastWinner == Team.RED) {
					blueToSpecBtn();
				}
				else {
					redToSpecBtn();
					blueToRedBtn();
				}
				topBtn();
				setTimeout(() => { room.startGame(); }, 2000);
			}
			else if (players.length == 4) {
				resetBtn();
				setTimeout(() => { randomBtn(); setTimeout(() => { randomBtn(); }, 500); }, 500);
				setTimeout(() => { room.startGame(); }, 2000);
			}
			else if (players.length == 5 || players.length >= 2 * maxTeamSize + 1) {
				if (lastWinner == Team.RED) {
					blueToSpecBtn();
				}
				else {
					redToSpecBtn();
					blueToRedBtn();
				}
				setTimeout(() => { topBtn(); }, 200);
				activateChooseMode();
			}
			else if (players.length == 6) {
				resetBtn();
				setTimeout(() => { randomBtn(); setTimeout(() => { randomBtn(); setTimeout(() => { randomBtn(); }, 500); }, 500); }, 500);
				setTimeout(() => { room.startGame(); }, 2000);
			}
		}
	}
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
	activePlay = false;
	countAFK = false;
	const scores = room.getScores();
	game.scores = scores;
	if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == team) {
		if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == team) {
			room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"));
			game.goals.push(new Goal(scores.time, team, lastPlayersTouched[0], lastPlayersTouched[1]));
		}
		else {
			room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"));
			game.goals.push(new Goal(scores.time, team, lastPlayersTouched[0], null));
		}
	}
	else {
		room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"));
		game.goals.push(new Goal(scores.time, team, null, null));
	}
	if (scores.scoreLimit != 0 && (scores.red == scores.scoreLimit || scores.blue == scores.scoreLimit && scores.blue > 0 || goldenGoal == true)) {
		endGame(team);
		goldenGoal = false;
		setTimeout(() => { room.stopGame(); }, 1000);
	}
}

room.onPositionsReset = function() {
	countAFK = true;
	lastPlayersTouched = [null, null];
}

/* MISCELLANEOUS */

room.onRoomLink = function(url) {
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
	if (getMute(changedPlayer) && changedPlayer.admin) {
		room.sendChat(changedPlayer.name + " has been unmuted.");
		setMute(changedPlayer, false);
	}
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
	checkTime();
	getLastTouchOfTheBall();
	getStats();
	handleInactivity();
}
