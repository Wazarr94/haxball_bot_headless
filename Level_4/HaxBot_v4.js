/*

Stats: "Auth" : '["0-Games", "1-Wins", "2-Draws", "3-Losses", "4-Winrate", "5-Goals", "6-Assists", "7-GK", "8-CS", "9-CS%", "10-Nick", "11-PW"]'

To save localStorage :
function getLocalStorage() {
	var tableau = [];
    Object.keys(localStorage).forEach(function(key) {
		tableau.push([key, localStorage.getItem(key)]);
	});
	var string = "[";
	for (var i = 0 ; i < data.length ; i++) {
		string += "['" + data[i][0] + "', '" + data[i][1] + "'], ";
	}
	string = string.substring(0,string.length - 2);
	string += "]";
	return string;
}
Copy what's given in the console
To load localStorage : 
function writeLocalStorage(data) {
    for (var i = 0 ; i < data.length ; i ++) {
		if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(data[i][0])) {
			localStorage.setItem(data[i][0], data[i][1]);
		}
	}
}

*/

/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const botName = "BOT";
const maxPlayers = 14;
const roomPublic = false;
const geo = [{"code": "DE", "lat": 51.1, "lon": 10.4}, {"code": "FR", "lat": 46.2, "lon": 2.2}, {"code": "PL", "lat": 51.9, "lon": 19.1}, {"code": "GB", "lat": 55.3, "lon": -3.4}, {"code": "PT", "lat": 39.3, "lon": -8.2}];
const scoreLimit = 3;
const timeLimit = 3;
const Team = {
	SPECTATORS: 0,
	RED: 1,
	BLUE: 2
};
const room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[4]});
room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);
var adminPassword = 100 + getRandomInt(900);
console.log("adminPassword : " + adminPassword);

/* STADIUM */

const playerRadius = 15;
var ballRadius = 10;
const triggerDistance = playerRadius + ballRadius + 0.01;
var aloneMap = '{"name":"Classic NO GOAL from HaxMaps","width":420,"height":200,"spawnDistance":170,"bg":{"type":"grass","width":370,"height":170,"kickOffRadius":75,"cornerRadius":0},"vertexes":[{"x":-370,"y":170,"trait":"ballArea"},{"x":-370,"y":64,"trait":"ballArea"},{"x":-370,"y":-64,"trait":"ballArea"},{"x":-370,"y":-170,"trait":"ballArea"},{"x":370,"y":170,"trait":"ballArea"},{"x":370,"y":64,"trait":"ballArea"},{"x":370,"y":-64,"trait":"ballArea"},{"x":370,"y":-170,"trait":"ballArea"},{"x":0,"y":200,"trait":"kickOffBarrier"},{"x":0,"y":75,"trait":"kickOffBarrier"},{"x":0,"y":-75,"trait":"kickOffBarrier"},{"x":0,"y":-200,"trait":"kickOffBarrier"},{"x":-380,"y":-64,"trait":"goalNet"},{"x":-400,"y":-44,"trait":"goalNet"},{"x":-400,"y":44,"trait":"goalNet"},{"x":-380,"y":64,"trait":"goalNet"},{"x":380,"y":-64,"trait":"goalNet"},{"x":400,"y":-44,"trait":"goalNet"},{"x":400,"y":44,"trait":"goalNet"},{"x":380,"y":64,"trait":"goalNet"}],"segments":[{"v0":0,"v1":1,"trait":"ballArea"},{"v0":2,"v1":3,"trait":"ballArea"},{"v0":4,"v1":5,"trait":"ballArea"},{"v0":6,"v1":7,"trait":"ballArea"},{"v0":12,"v1":13,"trait":"goalNet","curve":-90},{"v0":13,"v1":14,"trait":"goalNet"},{"v0":14,"v1":15,"trait":"goalNet","curve":-90},{"v0":16,"v1":17,"trait":"goalNet","curve":90},{"v0":17,"v1":18,"trait":"goalNet"},{"v0":18,"v1":19,"trait":"goalNet","curve":90},{"v0":8,"v1":9,"trait":"kickOffBarrier"},{"v0":9,"v1":10,"trait":"kickOffBarrier","curve":180,"cGroup":["blueKO"]},{"v0":9,"v1":10,"trait":"kickOffBarrier","curve":-180,"cGroup":["redKO"]},{"v0":10,"v1":11,"trait":"kickOffBarrier"}],"goals":[],"discs":[{"pos":[-370,64],"trait":"goalPost","color":"FFCCCC"},{"pos":[-370,-64],"trait":"goalPost","color":"FFCCCC"},{"pos":[370,64],"trait":"goalPost","color":"CCCCFF"},{"pos":[370,-64],"trait":"goalPost","color":"CCCCFF"}],"planes":[{"normal":[0,1],"dist":-170,"trait":"ballArea"},{"normal":[0,-1],"dist":-170,"trait":"ballArea"},{"normal":[0,1],"dist":-200,"bCoef":0.1},{"normal":[0,-1],"dist":-200,"bCoef":0.1},{"normal":[1,0],"dist":-420,"bCoef":0.1},{"normal":[-1,0],"dist":-420,"bCoef":0.1}],"traits":{"ballArea":{"vis":false,"bCoef":1,"cMask":["ball"]},"goalPost":{"radius":8,"invMass":0,"bCoef":0.5},"goalNet":{"vis":true,"bCoef":0.1,"cMask":["ball"]},"kickOffBarrier":{"vis":false,"bCoef":0.1,"cGroup":["redKO","blueKO"],"cMask":["red","blue"]}}}'
var classicMap = '';
var bigMap = '';

/* OPTIONS */

var afkLimit = 12;
var drawTimeLimit = Infinity;
var maxTeamSize = 4;
var slowMode = 0;

/* PLAYERS */

var players;
var extendedP = []; // ["0-ID", "1-Auth", "2-Conn", "3-AFK", "4-Activity", "5-GK", "6-Mute"]
const eP = {
	ID: 0,
	AUTH: 1,
	CONN: 2,
	AFK: 3,
	ACT: 4,
	GK: 5,
	MUTE: 6
};
var teamR;
var teamB;
var teamS;

/* GAME */

var lastTeamTouched;
var lastPlayersTouched;
var countAFK = false;
var activePlay = false;
var goldenGoal = false;
var SMSet = new Set();
var banList = [];

/* STATS */

var game;
var GKList = ["",""];
var Rposs = 0;
var Bposs = 0;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var lastWinner = Team.SPECTATORS;
var streak = 0;

/* BALANCE & CHOOSE */

var inChooseMode = false;
var redCaptainChoice = "";
var blueCaptainChoice = "";
var chooseTime = 20;
var timeOutCap;

/* AUXILIARY */

var checkTimeVariable = 0;
var statNumber = 0;
var playerInOrOut = 0;
var resettingTeams = false;

room.setCustomStadium(aloneMap);

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

function blueToRedBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[i].id, Team.RED);
	}
}

function redToBlueBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[i].id, Team.BLUE);
	}
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	game.scores = scores;
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01) {
		if (scores.red != scores.blue) {
			checkTimeVariable += 1;
			if (checkTimeVariable == 1) {
				if (scores.red > scores.blue) {
					endGame(Team.RED);
					setTimeout(function(){ room.stopGame(); }, 2000);
				}
				else {
					endGame(Team.BLUE);
					setTimeout(function(){ room.stopGame(); }, 2000);
				}
			}
			setTimeout(function() { checkTimeVariable = 0; }, 3000); 
			return;
		}
		goldenGoal = true;
		room.sendChat("⚽ First goal wins! ⚽");
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		checkTimeVariable += 1;
		if (checkTimeVariable == 1) {
			room.sendChat("⌛ 60 seconds left until draw! ⌛");
		}
		setTimeout(function() { checkTimeVariable = 0; }, 10); 
		return;
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) {
		checkTimeVariable += 1;
		if (checkTimeVariable == 1) {
			endGame(Team.SPECTATORS);
			room.stopGame();
			goldenGoal = false;
		}
		setTimeout(function() { checkTimeVariable = 0; }, 10); 
		return;
	}
}

function endGame(winner) { // no stopGame() function in it
	if (players.length >= 2 * maxTeamSize - 1) {
		inChooseMode = true;
	}
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
			room.sendChat("🏆 " + GKList[0].name + " kept a CS ! ");
		}
	}
	else if (winner == Team.BLUE) {
		lastWinner = Team.BLUE;
		streak = 1;
		room.sendChat("🔵 Blue Team won " + scores.blue + "-" + scores.red + " ! Current streak : " + streak + " 🏆");
		room.sendChat("⭐ Possession : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵");
		if (scores.red == 0) {
			room.sendChat("🏆 " + GKList[1].name + " kept a CS ! ");
		}
	}
	else {
		lastWinner = Team.SPECTATORS;
		streak = 0;
		room.sendChat("💤 Draw limit reached! 💤");
		room.sendChat("⭐ Possession : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵");
		if (scores.red == 0) {
			room.sendChat("🏆 " + GKList[1].name + " and " + GKList[0].name + " kept a CS ! ");
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

/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList().filter((player) => player.id != 0);
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}

function handleInactivity() {
	if (countAFK && players.length > 1) {
		for (var i = 0; i < teamR.length ; i++) {
			getActivity(teamR[i])++;
		}
		for (var i = 0; i < teamB.length ; i++) {
			getActivity(teamB[i])++;
		}
	}
	for (var i = 0; i < extendedP.length ; i++) {
		if (extendedP[i][eP.ID][eP.AFK] >= 60 * afkLimit) {
			extendedP[i][eP.ID][eP.AFK] = 0;
            if (room.getScores().time <= afkLimit - 0.5) {
                setTimeout(function() { 
                    if (!inChooseMode) {
                        quickRestart();
                    }
                    else {
                        room.stopGame();
                    }
                }, 50);
			}
			room.kickPlayer(extendedP[i][eP.ID],"AFK",false);
		}
	}
}

function getAuth(player) {
	return extendedP.filter((a) => a[0] == player.id)[eP.ID][eP.AUTH];
}

function getActivity(player) {
	return extendedP.filter((a) => a[0] == player.id)[eP.ID][eP.ACT];
}

function getGK(player) {
	return extendedP.filter((a) => a[0] == player.id)[eP.ID][eP.GK];
}

function getMute(player) {
	return extendedP.filter((a) => a[0] == player.id)[eP.ID][eP.MUTE];
}

/* BALANCE & CHOOSE FUNCTIONS */

function updateRoleOnPlayerIn() {
	playerInOrOut = 1;
	setTimeout(function() { playerInOrOut = 0; }, 100);
	players = room.getPlayerList().filter((player) => player.id != 0);
	updateTeams();
	if (inChooseMode) {
		if (players.length == 6) {
			(bigMap != '') ? room.setCustomStadium(bigMap) : room.setDefaultStadium("Big");
		}
		getSpecList();
	}
	balanceTeams();
}

function updateRoleOnPlayerOut() {
	playerInOrOut = 2;
    setTimeout(function() { playerInOrOut = 0; }, 100);
    updateTeams();
	players = room.getPlayerList().filter((player) => player.id != 0);
	if (room.getScores() != null) {
		var scores = room.getScores();
		if (players.length >= 2 * maxTeamSize && scores.time >= (5/6) * game.scores.timeLimit && teamR.length != teamB.length) {
			if (teamR.length < teamB.length) {
				if (scores.blue - scores.red == 2) {
					endGame(Team.BLUE);
					room.sendChat("🤖 Ragequit detected. Game ended 🤖");
					setTimeout(function() { room.stopGame(); }, 110);
					return;
				}
			}
			else {
				if (scores.red - scores.blue == 2) {
					endGame(Team.RED);
					room.sendChat("🤖 Ragequit detected. Game ended 🤖");
					setTimeout(function() { room.stopGame(); }, 110);
					return;
				}
			}
		}
	}
	if (inChooseMode) {
		if(players.length == 5) {
			(classicMap != '') ? room.setCustomStadium(classicMap) : room.setDefaultStadium("Classic");
		}
		if (teamR.length == 0 || teamB.length == 0) {
			if (teamR.length == 0) {
				room.setPlayerTeam(teamS[0].id, Team.RED);
			}
			else {
				room.setPlayerTeam(teamS[0].id, Team.BLUE);
			}
			return;
		}
		if (Math.abs(teamR.length - teamB.length) == teamS.length) {
			room.sendChat("🤖 No choices left, let me handle this situation... 🤖");
			inChooseMode = false;
			redCaptainChoice = "";
			blueCaptainChoice = "";
			clearTimeout(timeOutCap);
			var b = teamS.length;
			if (teamR.length > teamB.length) {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(function() { room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 5*i);
				}
			}
			else {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(function() { room.setPlayerTeam(teamS[0].id, Team.RED); }, 5*i);
				}
			}
			resumeGame();
			return;
		}
		if (streak == 0 && room.getScores() == null ) {
			if (Math.abs(teamR.length - teamB.length) == 2) { // if someone left a team has 2 more players than the other one, put the last chosen guy back in his place so it's fair
				room.sendChat("🤖 Balancing teams... 🤖");
				if (teamR.length > teamB.length) {
					room.setPlayerTeam(teamR[teamR.length-1].id, Team.SPECTATORS);
				}
				else {
					room.setPlayerTeam(teamB[teamB.length-1].id, Team.SPECTATORS);
				}
			}
		}
		if (teamR.length == teamB.length && teamS.length < 2) {
			inChooseMode = false;
			redCaptainChoice = "";
			blueCaptainChoice = "";
			clearTimeout(timeOutCap);
			resumeGame();
			return;
		}
		getSpecList();
	}
	balanceTeams();
}

function balanceTeams() {
	if (!inChooseMode) {
		if (players.length == 1 && teamR.length == 0) {
            quickRestart();
            room.setCustomStadium(aloneMap);
			room.setPlayerTeam(players[0].id, Team.RED);
		}
		else if (Math.abs(teamR.length - teamB.length) == teamS.length && teamS.length > 0) {
			const n = Math.abs(teamR.length - teamB.length);
			if (players.length == 2) {
                (classicMap != '') ? room.setCustomStadium(classicMap) : room.setDefaultStadium("Classic");
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
				room.setCustomStadium(aloneMap);
				room.setPlayerTeam(players[0].id, Team.RED);
				return;
			}
			else if (players.length == 5) {
				quickRestart();
                (classicMap != '') ? room.setCustomStadium(classicMap) : room.setDefaultStadium("Classic");
			}
			else if (players.length == maxTeamSize * 2 - 1) {
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
			inChooseMode = true;
			choosePlayer();
		}
		else if (teamS.length >= 2 && teamR.length == teamB.length && teamR.length < maxTeamSize) {
			if (teamR.length == 2) {
				quickRestart();
				(bigMap != '') ? room.setCustomStadium(bigMap) : room.setDefaultStadium("Big");
			}
			room.setPlayerTeam(teamS[0].id, Team.RED);
			room.setPlayerTeam(teamS[1].id, Team.BLUE);
		}
	}
}

function choosePlayer() {
	clearTimeout(timeOutCap);
	if (teamR.length <= teamB.length && teamR.length != 0) {
		room.sendChat(teamR[0].name + ", to choose a player, enter his number in the spectators list or use 'top', 'random' or 'bottom'");
		timeOutCap = setTimeout(function(name) { room.sendChat("Hurry up " + name + ", only 10 seconds left to choose!"); setTimeout(function(id) { room.kickPlayer(id,"You didn't choose in time!", false);}, chooseTime * 500, teamR[0].id); }, chooseTime * 1000, teamR[0].name);
	}
	else if (teamB.length < teamR.length && teamB.length != 0) {
		room.sendChat(teamB[0].name + ", to choose a player, enter his number in the spectators list or use 'top', 'random' or 'bottom'");
		timeOutCap = setTimeout(function(name) { room.sendChat("Hurry up " + name + ", only 10 seconds left to choose!"); timeOutCap = setTimeout(function(id) { room.kickPlayer(id,"You didn't choose in time!", false);}, chooseTime * 500, teamB[0].id); }, chooseTime * 1000, teamB[0].name);
	}
	getSpecList();
}

function getSpecList() {
	var cstm = "Spectators : ";
	for ( var i = 0 ; i < teamS.length ; i++ ) {
		if (140 - cstm.length < (teamS[i].name + "[" + (i+1) + "], ").length ) {
			room.sendChat(cstm);
			cstm = "... ";
		}
		cstm += teamS[i].name + "[" + (i+1) + "], ";
	}
	cstm = cstm.substring(0,cstm.length - 2);
	cstm += ".";
	room.sendChat(cstm);
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
		updateTeams();
		lastTeamTouched == Team.RED ? Rposs++ : Bposs++;
		var ballPosition = room.getBallPosition();
		point[1] = point[0];
		point[0] = ballPosition;
		ballSpeed = (pointDistance(point[0], point[1])*60*60*60)/15000;
		var k = [-1, Infinity];
		for (var i = 0; i < teamR.length; i++) {
			if (teamR[i].position.x < k[1]) {
				k[0] = teamR[i];
				k[1] = teamR[i].position.x;
			}
		}
		getGK(k[0])++;
		k = [-1, -Infinity];
		for (var i = 0; i < teamB.length; i++) {
			if (teamB[i].position.x > k[1]) {
				k[0] = teamB[i];
				k[1] = teamB[i].position.x;
			}
		}
		getGK(k[0])++;
	}
}

function updateStats(winner) {
	if (players.length >= 2 * maxTeamSize && (game.scores.time >= (5/6) * game.scores.timeLimit || game.scores.red == game.scores.scoreLimit || game.scores.blue == game.scores.scoreLimit) && allReds.length > 3 && allBlues.length > 3) {
		for (var i = 0; i < allReds.length ; i++) {
			if (localStorage.getItem(getAuth(allReds[i]))) {
				var stats = JSON.parse(localStorage.getItem(getAuth(allReds[i])));
			}
			else {
				var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00",allReds[i].name];
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
			localStorage.setItem(getAuth(allReds[i]), JSON.stringify(stats));
		}
		for (var i = 0; i < allBlues.length ; i++) {
			if (localStorage.getItem(getAuth(allBlues[i]))) {
				var stats = JSON.parse(localStorage.getItem(getAuth(allBlues[i])));
			}
			else {
				var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00",allBlues[i].name];
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
			localStorage.setItem(getAuth(allBlues[i]), JSON.stringify(stats));
		}
		for (var i = 0; i < game.goals.length ; i++) {
            if (game.goals[i].striker != null) {
                if ((allBlues.concat(allReds)).findIndex((player) => player.id == game.goals[i].striker.id) != -1) {
                    var stats = JSON.parse(localStorage.getItem(getAuth(game.goals[i].striker)));
                    stats[5]++;
                    localStorage.setItem(getAuth(game.goals[i].striker), JSON.stringify(stats));
                }
            }
            if (game.goals[i].assist != null) {
                if ((allBlues.concat(allReds)).findIndex((player) => player.name == game.goals[i].assist.name) != -1) {
                    var stats = JSON.parse(localStorage.getItem(getAuth(game.goals[i].assist)));
                    stats[6]++;
                    localStorage.setItem(getAuth(game.goals[i].assist), JSON.stringify(stats));
                }
            }
		}
		if (allReds.findIndex((player) => player.id == GKList[0].id) != -1) {
			var stats = JSON.parse(localStorage.getItem(getAuth(GKList[0])));
			stats[7]++;
			if (game.scores.blue == 0) {
				stats[8]++;
			}
			stats[9] = (100*stats[8]/stats[7]).toPrecision(3);
			localStorage.setItem(getAuth(GKList[0]), JSON.stringify(stats));
		}
		if (allBlues.findIndex((player) => player.id == GKList[1].id) != -1) {
			var stats = JSON.parse(localStorage.getItem(getAuth(GKList[1])));
			stats[7]++;
			if (game.scores.red == 0) {
				stats[8]++;
			}
			stats[9] = (100*stats[8]/stats[7]).toPrecision(3);
			localStorage.setItem(getAuth(GKList[1]), JSON.stringify(stats));
		}
	}
}

function findGK() {
	var tab = [[0,""], [0,""]];
	for (var i = 0; i < extendedP.length ; i++) {
		if (room.getPlayer(extendedP[i][eP.ID]).team == Team.RED) {
			if (tab[0][0] < extendedP[i][eP.GK]) {
				tab[0][0] = extendedP[i][eP.GK];
				tab[0][1] = room.getPlayer(extendedP[i][eP.ID]);
			}
		}
		else if (room.getPlayer(extendedP[i][eP.ID]).team == Team.BLUE) {
			if (tab[1][0] < extendedP[i][eP.GK]) {
				tab[1][0] = extendedP[i][eP.GK];
				tab[1][1] = room.getPlayer(extendedP[i][eP.ID]);
			}
		}
	}
	GKList = [tab[0][1], tab[1][1]];
}

setInterval(function() {
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
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[1])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
		}
	if (statNumber % 5 == 2) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[5])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (statNumber % 5 == 3) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[6])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	if (statNumber % 5 == 4) {
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([key,(JSON.parse(localStorage.getItem(key))[8])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1]);
	}
	statNumber++;
}, 6 * 60 * 1000);

/* EVENTS */

room.onPlayerJoin = function(player) {
    updateRoleOnPlayerIn();
	extendedP.push([player.id, player.auth, player.conn, false, 0, 0, false]);
	room.sendChat("[PV] 👋 Welcome " + player.name + " ! Type '!help' to see the commands.", player.id);
	if (localStorage.getItem(player.auth) != null) {
		room.sendChat(player.name + " automatically logged in !");
	}
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	if (changedPlayer.id == 0) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		return;
	}
	if (room.getScores() != null) {
		var scores = room.getScores();
		if (changedPlayer.team != Team.SPECTATORS && scores.time <= (3/4) * scores.timeLimit  && Math.abs(scores.blue - scores.red) < 2) {
			(changedPlayer.team == Team.RED) ? allReds.push(changedPlayer) : allBlues.push(changedPlayer);
		}
	}
	if (changedPlayer.team == Team.SPECTATORS) {
		updateLists(Math.max(teamR.findIndex((p) => p.id == changedPlayer.id), teamB.findIndex((p) => p.id == changedPlayer.id), teamS.findIndex((p) => p.id == changedPlayer.id)), changedPlayer.team);
	}
	updateTeams();
	if (inChooseMode && resettingTeams == false && byPlayer.id == 0) {
		if (Math.abs(teamR.length - teamB.length) == teamS.length) {
			inChooseMode = false;
			redCaptainChoice = "";
			blueCaptainChoice = "";
			clearTimeout(timeOutCap);
			var b = teamS.length;
			if (teamR.length > teamB.length) {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(function() { room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 500*i);
				}
			}
			else {
				for (var i = 0 ; i < b ; i++) {
					setTimeout(function() { room.setPlayerTeam(teamS[0].id, Team.RED); }, 200*i);
				}
			}
			resumeGame();
			return;
		}
		else if ((teamR.length == maxTeamSize && teamB.length == maxTeamSize) || (teamR.length == teamB.length && teamS.length < 2)) {
			inChooseMode = false;
			clearTimeout(timeOutCap);
			resumeGame();
			redCaptainChoice = "";
			blueCaptainChoice = "";
		}
		else if (teamR.length <= teamB.length && redCaptainChoice != "") { // choice remembered
			if (redCaptainChoice == "top") {
				room.setPlayerTeam(teamS[0].id,Team.RED);
			}
			else if (redCaptainChoice == "random") {
				var r = getRandomInt(teamS.length);
				room.setPlayerTeam(teamS[r].id, Team.RED);
			}
			else if (redCaptainChoice == "bottom") {
				room.setPlayerTeam(teamS[teamS.length - 1].id, Team.RED);
			}
			return;
		}
		else if (teamB.length < teamR.length && blueCaptainChoice != "") {
			if (blueCaptainChoice == "top") {
				room.setPlayerTeam(teamS[0].id,Team.BLUE);
			}
			else if (blueCaptainChoice == "random") {
				var r = getRandomInt(teamS.length);
				room.setPlayerTeam(teamS[r].id, Team.BLUE);
			}
			else if (blueCaptainChoice == "bottom") {
				room.setPlayerTeam(teamS[teamS.length - 1].id, Team.BLUE);
			}
			return;
		}
		else {
			choosePlayer();
		}
	}
}

room.onPlayerLeave = function(player) {
    updateLists(Math.max(teamR.findIndex((p) => p.id == player.id), teamB.findIndex((p) => p.id == player.id), teamS.findIndex((p) => p.id == player.id)), player.team);
    updateRoleOnPlayerOut();
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
	if (ban == true) {
		banList.push([kickedPlayer.name, kickedPlayer.id]);
	}
}

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	if (player.team != Team.SPECTATORS) {
		getActivity(player) = 0;
	}
	if (message[0].toLowerCase() == "!help") {
		room.sendChat("[PV] Player commands : !me, !register <pw>, !games, !wins, !goals, !assists, !cs. PW must be > 4 characters.", player.id);
		if (player.admin) {
			room.sendChat("[PV] Admin : !balance, !mute <team> <position> <duration = 3>, !unmute all/<nick>, !clearbans, !slowmode <duration>", player.id);
		}
	}
	if (message[0].toLowerCase() == "!register") {
		if (JSON.parse(localStorage.getItem(getAuth(player))) == undefined || JSON.parse(localStorage.getItem(getAuth(player)))[11] == undefined) {
			if (message.length == 2) {
				if (message[1].length < 4) {
					room.sendChat("[PV] Your password should be over 4 characters ! Please try again.", player.id)
					return false;
				}
				room.sendChat(player.name + " successfully registered and logged in !");
				if (localStorage.getItem(getAuth(player))) {
					var stats = JSON.parse(localStorage.getItem(getAuth(player)));
				}
				else {
					var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00",player.name];
				}
				stats.push(message[1]);
				localStorage.setItem(getAuth(player), JSON.stringify(stats));
				return false;
			}
		}
		if (JSON.parse(localStorage.getItem(getAuth(player)))[11] != undefined) {
			room.sendChat("[PV] You already registered ! Contact admin to get your password back", player.id);
		}
	}
	if (message[0].toLowerCase() == "!me") {
		if (localStorage.getItem(getAuth(player))) {
			var stats = JSON.parse(localStorage.getItem(getAuth(player)));
		}
		else {
			var stats = [0,0,0,0,"0.00",0,0,0,0,"0.00"];
		}
		room.sendChat("[PV] " + player.name + "> Game: " + stats[0] + ", Win: " + stats[1] + ", Draw: " + stats[2] + ", Loss: " + stats[3] + ", WR: " + stats[4] + "%, Goal: " + stats[5] + ", Assist: " + stats[6] + ", GK: " + stats[7] + ", CS: " + stats[8] + ", CS%: " + stats[9] + "%", player.id	);
	}
	if (message[0].toLowerCase() == "!games") {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[0])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Games> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	if (message[0].toLowerCase() == "!wins") {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[1])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	if (message[0].toLowerCase() == "!goals") {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[5])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	if (message[0].toLowerCase() == "!assists") {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[6])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	if (message[0].toLowerCase() == "!cs") {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[8])]); } });
		if (tableau.length < 5) {
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] CS> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	if (message[0].toLowerCase() == '!claim') {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
			adminPassword = 100 + getRandomInt(900);
			console.log("adminPassword : " + adminPassword);
		}
	}
	if (message[0].toLowerCase() == "!mute") {
		if (player.admin) {
			if (message.length == 3 || message.length == 4) {
				if (["R","B","S"].includes(message[1])) {
					var timeOut;
					if (message[1] == "R") {
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
								setTimeout(function() { getMute(teamR[Number.parseInt(message[2]) - 1]) = false; }, timeOut);
								getMute(teamR[Number.parseInt(message[2]) - 1]) = true;
								room.sendChat(teamR[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
							}
						}
					}
					if (message[1] == "B") {
						if (!Number.isNaN(Number.parseInt(message[2]))) {
							if (Number.parseInt(message[2]) <= teamB.length || Number.parseInt(message[2]) > 0) {
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
								setTimeout(function() { getMute(teamB[Number.parseInt(message[2]) - 1]) = false; }, timeOut);
								getMute(teamB[Number.parseInt(message[2]) - 1]) = true;
								room.sendChat(teamB[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
							}
						}
					}
					if (message[1] == "S") {
						if (!Number.isNaN(Number.parseInt(message[2]))) {
							if (Number.parseInt(message[2]) <= teamS.length || Number.parseInt(message[2]) > 0) {
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
								setTimeout(function() { getMute(teamS[Number.parseInt(message[2]) - 1]) = false; }, timeOut);
								getMute(teamS[Number.parseInt(message[2]) - 1]) = true;
								room.sendChat(teamS[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
							}
						}
					}
				}
			}
		}
		return false;
    }
    if (message[0].toLowerCase() == "!unmute") {
		if (player.admin) {
			if (message.length == 2 && message[1] == "all") {
				extendedP.forEach((ePlayer) => { ePlayer[eP.MUTE] = false; });
				room.sendChat("Mutes cleared");
			}
			if (message.length >= 2) {
				var name = "";
				for (var i = 1 ; i < message.length ; i++) {
					name += message[i] + " ";
				}
				name = name.substring(0, name.length - 1);
				players.filter((p) => p.name == name).forEach((element) => { getMute(element) = false; });
			}
		}
    }
	if (message[0].toLowerCase() == "!slow") {
		if (player.admin) {
			if (message.length == 1) {
				slowMode = 2;
				room.sendChat("2s Slow Mode enabled !");
			}
			else if (message.length == 2) {
				if (!Number.isNaN(Number.parseInt(message[1]))) {
					if (Number.parseInt(message[1]) > 0) {
						slowMode = Number.parseInt(message[1]);
						room.sendChat(slowMode + "s Slow Mode enabled !");
						return;
					}
				}
				slowMode = 2;
				room.sendChat("2s Slow Mode enabled !");
			}
		}
	}
	if (message[0].toLowerCase() == "!endslow") {
		if (player.admin) {
			slowMode = 0;
		}
	}
	if (message[0].toLowerCase() == "!clearbans") {
		if (player.admin) {
			if (message.length == 1) {
				room.clearBans();
				room.sendChat("Bans cleared");
				banList = [];
			}
			if (message.length == 2) {
				if (!Number.isNaN(Number.parseInt(message[1]))) {
					if (Number.parseInt(message[1]) > 0) {
						ID = Number.parseInt(message[1]);
						room.clearBan(ID);
						banList.filter((array) => array[1] != ID);
					}
				}
			}
		}
	}
	if (inChooseMode && teamR.length != 0 && teamB.length != 0) {
		if (player.id == teamR[0].id || player.id == teamB[0].id) { // we care if it's one of the captains choosing
			if (teamR.length <= teamB.length && player.id == teamR[0].id) { // we care if it's red turn && red cap talking
				if (message[0].toLowerCase() == "top" || message[0].toLowerCase() == "!top") {
					room.setPlayerTeam(teamS[0].id, Team.RED);
					redCaptainChoice = "top";
					clearTimeout(timeOutCap);
					return true;
				}
				else if (message[0].toLowerCase() == "random" || message[0].toLowerCase() == "!random") {
					var r = getRandomInt(teamS.length);
					room.setPlayerTeam(teamS[r].id, Team.RED);
					redCaptainChoice = "random";
					clearTimeout(timeOutCap);
					return true;
				}
				else if (message[0].toLowerCase() == "bottom" || message[0].toLowerCase() == "!bottom") {
					room.setPlayerTeam(teamS[teamS.length - 1].id, Team.RED);
					redCaptainChoice = "bottom";
					clearTimeout(timeOutCap);
					return true;
				}
				else if (message[0].toLowerCase() == "auto" || message[0].toLowerCase() == "!auto") {
					room.sendChat("Sorry, I don't know what you mean by 'auto'! Try again with 'top' or 'random'!");
					return true;
				}
				else if (!Number.isNaN(Number.parseInt(message[0]))) {
					if (Number.parseInt(message[0]) > teamS.length || Number.parseInt(message[0]) < 1) {
						room.sendChat("Your number is invalid!");
						return true;
					}
					else {
						room.setPlayerTeam(teamS[Number.parseInt(message[0])-1].id, Team.RED);
						clearTimeout(timeOutCap);
						return true;
					}
				}
			}
			if (teamB.length < teamR.length && player.id == teamB[0].id) {
				if (message[0].toLowerCase() == "top" || message[0].toLowerCase() == "!top") {
					room.setPlayerTeam(teamS[0].id, Team.BLUE);
					blueCaptainChoice = "top";
					clearTimeout(timeOutCap);
					return true;
				}
				else if (message[0].toLowerCase() == "random" || message[0].toLowerCase() == "!random") {
					var r = getRandomInt(teamS.length);
					room.setPlayerTeam(teamS[r].id, Team.BLUE);
					blueCaptainChoice = "random";
					clearTimeout(timeOutCap);
					return true;
				}
				else if (message[0].toLowerCase() == "bottom" || message[0].toLowerCase() == "!bottom") {
					room.setPlayerTeam(teamS[teamS.length - 1].id, Team.BLUE);
					blueCaptainChoice = "bottom";
					clearTimeout(timeOutCap);
					return true;
				}
				else if (message[0].toLowerCase() == "auto" || message[0].toLowerCase() == "!auto") {
					room.sendChat("Sorry, I don't know what you mean by 'auto'! Try again with 'top' or 'random'!");
					return true;
				}
				else if (!Number.isNaN(Number.parseInt(message[0]))) {
					if (Number.parseInt(message[0]) > teamS.length || Number.parseInt(message[0]) < 1) {
						room.sendChat("Your number is invalid!");
						return true;
					}
					else {
						room.setPlayerTeam(teamS[Number.parseInt(message[0])-1].id, Team.BLUE);
						clearTimeout(timeOutCap);
						return true;
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
	getActivity(player) = 0;
}

room.onGameStart = function(byPlayer) {
	game = new Game(Date.now(), room.getScores(), []);
	countAFK = true;
	goldenGoal = false;
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
		if (room.getPlayer(extendedP[i][eP.ID]) == null) {
			extendedP.splice(i, 1);
			continue;
		}
		extendedP[i][eP.GK] = 0;
		extendedP[i][eP.ACT] = 0;
	}
	inChooseMode = false;
}

room.onGameStop = function(byPlayer) {
	if (byPlayer.id == 0) {
		if (playerInOrOut != 0) {
			return;
		}
		players = room.getPlayerList().filter((player) => player.id != 0);
		if (inChooseMode) {
			if (players.length == 2 * maxTeamSize) {
				inChooseMode = false;
				resetBtn();
				for (var i = 0; i < maxTeamSize; i++) {
					setTimeout(function() { randomBtn(); }, 499*i);
				}
				setTimeout(function(){ room.startGame(); }, 2000);
			}
			else {
				if (lastWinner == Team.RED) {
					blueToSpecBtn();
					setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 500);
				}
				else if (lastWinner == Team.BLUE) {
					redToSpecBtn();
					var n = teamB.length;
					for (var i = 0; i < n; i++) {
						setTimeout(function() { room.setPlayerTeam(teamB[0].id,Team.RED); }, 20*i);
					}
					setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 500);
					lastWinner == Team.RED;
				}
				else {
					resetBtn();
					setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.RED); }, 500);
					setTimeout(function(){ room.setPlayerTeam(teamS[0].id, Team.BLUE); }, 1000);
				}
			}
        }
        else {
            if (players.length == 2) {
                if (lastWinner == Team.BLUE) {
                    room.setPlayerTeam(teamB[0].id,Team.RED);
                    room.setPlayerTeam(teamR[0].id,Team.BLUE);
                    lastWinner == Team.RED;
                }
                setTimeout(function(){ room.startGame(); }, 2000);
            }
            else if (players.length == 3) {
                if (lastWinner == Team.RED) {
                    room.setPlayerTeam(teamB[0].id,Team.SPECTATORS);
                    room.setPlayerTeam(teamS[0].id,Team.BLUE);
                    setTimeout(function(){ room.startGame(); }, 2000);
                }
                else {
                    room.setPlayerTeam(teamB[0].id,Team.RED);
                    room.setPlayerTeam(teamR[0].id,Team.SPECTATORS);
                    room.setPlayerTeam(teamS[0].id,Team.BLUE);
                    setTimeout(function(){ room.startGame(); }, 2000);
                    lastWinner = Team.RED;
                }
            }
            else if (players.length == 4) {
                resetBtn();
                setTimeout(function(){ randomBtn(); }, 500);
                setTimeout(function(){ randomBtn(); }, 1000);
                setTimeout(function(){ room.startGame(); }, 2000);
            }
            else if (players.length == 5) {
                if (lastWinner == Team.RED) {
                    resettingTeams = true;
                    room.setPlayerTeam(teamB[0].id,Team.SPECTATORS);
                    room.setPlayerTeam(teamB[1].id,Team.SPECTATORS);
                    setTimeout(function(){ resettingTeams = false; }, 100);
                    setTimeout(function() { room.setPlayerTeam(teamS[0].id,Team.BLUE); }, 200);
                    inChooseMode = true;
                }
                else {
                    resettingTeams = true;
                    room.setPlayerTeam(teamB[0].id,Team.RED);
                    room.setPlayerTeam(teamB[1].id,Team.RED);
                    room.setPlayerTeam(teamR[0].id,Team.SPECTATORS);
                    room.setPlayerTeam(teamR[1].id,Team.SPECTATORS);
                    setTimeout(function(){ resettingTeams = false; }, 100);
                    setTimeout(function() { room.setPlayerTeam(teamS[0].id,Team.BLUE); }, 200);
                    lastWinner = Team.RED;
                    inChooseMode = true;
                }
            }
            else if (players.length == 6) {
                resetBtn();
                setTimeout(function(){ randomBtn(); }, 500);
                setTimeout(function(){ randomBtn(); }, 1000);
                setTimeout(function(){ randomBtn(); }, 1500);
                setTimeout(function(){ room.startGame(); }, 2000);
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
