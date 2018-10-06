/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const botName = "BOT";
const maxPlayers = 12;
const roomPublic = false;
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

const room = HBInit({roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[0]});

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);

/* STADIUM */

const playerRadius = 15;
var ballRadius = 10;

/* OPTIONS */

var drawTimeLimit = Infinity;
var maxTeamSize = 4;

/* PLAYERS */

var players;
var teamR;
var teamB;
var teamS;

/* GAME */

const triggerDistance = playerRadius + ballRadius + 0.01;
var lastTeamTouched;
var lastPlayersTouched;
var goldenGoal = false;
var activePlay = false;
var muteList = [];

/* STATS */

var GKList = new Array(2 * maxTeamSize).fill(0);
var Rposs = 0;
var Bposs = 0;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var lastWinner = Team.SPECTATORS;
var streak = 0;

/* AUXILIARY */



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
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01) {
		if (scores.red != scores.blue) {
			if (scores.red > scores.blue) {
				endGame(Team.RED);
				setTimeout(function(){ room.stopGame(); }, 1000);
			}
			else {
				endGame(Team.BLUE);
				setTimeout(function(){ room.stopGame(); }, 1000);
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

/* EVENTS */

room.onPlayerJoin = function(player) {
	room.sendChat("Welcome " + player.name + " !");
	updateTeams();
	updateAdmins();
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
	updateAdmins();
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	if (message[0] == '!claim') {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
		}
	}
	if (message[0] == "!mute") {
		if (player.admin) {
			if (message.length == 3 || message.length == 4) {
				if (["R","B","S"].includes(message[1])) { // message[1] in ["R", "B", "S"]
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
							}
						}
						setTimeout(function(name) { muteList = muteList.filter((p) => p != name) }, timeOut, teamR[Number.parseInt(message[2]) - 1].name);
						muteList.push(teamR[Number.parseInt(message[2]) - 1].name);
						room.sendChat(teamR[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
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
							}
						}
						setTimeout(function(name) { muteList = muteList.filter((p) => p != name) }, timeOut, teamB[Number.parseInt(message[2]) - 1].name);
						muteList.push(teamB[Number.parseInt(message[2]) - 1].name);
						room.sendChat(teamB[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
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
							}
						}
						setTimeout(function(name) { muteList = muteList.filter((p) => p != name) }, timeOut, teamS[Number.parseInt(message[2]) - 1].name);
						muteList.push(teamS[Number.parseInt(message[2]) - 1].name);
						room.sendChat(teamS[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
					}
				}
			}
		}
		return false;
    }
    if (message[0] == "!unmute") {
		if (player.admin) {
			if (message.length == 2 && message[1] == "all") {
				muteList = [];
			}
			if (message.length >= 2) {
				var name = "";
				for (var i = 1 ; i < message.length ; i++) {
					name += message[i] + " ";
				}
				name = name.substring(0,name.length - 1);
				muteList = muteList.filter((p) => p != name);
			}
		}
    }
	if (message[0] == "!clearbans") {
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
}

room.onGameStart = function(byPlayer) {
	GKList = new Array(2 * maxTeamSize).fill(0);
    Rposs = 0;
	Bposs = 0;
	lastPlayersTouched = [null, null];
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
			goldenGoal = false;
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
			goldenGoal = false;
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
}

room.onPositionsReset = function() {
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
}
