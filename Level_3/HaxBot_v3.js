// Stats: "Auth" : '["0-Games", "1-Wins", "2-Draws", "3-Losses", "4-Winrate", "5-Goals", "6-Assists", "7-GK", "8-CS", "9-CS%", "10-Nick", "11-(Opt)PW"]'

/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const botName = "HaxBot";
const maxPlayers = 12;
const roomPublic = true;
const geo = [{"code": "DE", "lat": 51.1, "lon": 10.4}, {"code": "FR", "lat": 46.2, "lon": 2.2}, {"code": "PL", "lat": 51.9, "lon": 19.1}, {"code": "GB", "lat": 55.3, "lon": -3.4}, {"code": "PT", "lat": 39.3, "lon": -8.2}];

const room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[0] });

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);
const scoreLimit = 3;
const timeLimit = 3;

var adminPassword = 100 + getRandomInt(900);
console.log("adminPassword : " + adminPassword);

/* STADIUM */

const playerRadius = 15;
var ballRadius = 10;
const triggerDistance = playerRadius + ballRadius + 0.01;

/* OPTIONS */

var afkLimit = 12;
var drawTimeLimit = Infinity;
var maxTeamSize = 4;
var slowMode = 0;

/* PLAYERS */

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };
var extendedP = [];
const eP = { ID: 0, AUTH: 1, CONN: 2, AFK: 3, ACT: 4, GK: 5, MUTE: 6 };
var allPlayers;
var players;
var teamR;
var teamB;
var teamS;
var allTeamS;

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
var allBlues = [];
var allReds = [];

/* AUXILIARY */

var checkTimeVariable = false;
var statNumber = 0;
var endGameVariable = false;
var statInterval = 6;

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
    var len = arr.length;
    var min = Infinity;
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
				setTimeout(() => { checkTimeVariable = false; }, 10);
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

/* PLAYER FUNCTIONS */

function updateTeams() { // update the players' list and all the teams' list
	allPlayers = room.getPlayerList().filter((player) => player.id != 0);
	players = room.getPlayerList().filter((player) => player.id != 0 && !getAFK(player));
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
	allTeamS = allPlayers.filter(p => p.team === Team.SPECTATORS);
}

function updateAdmins() {
	if (players.length == 0 || players.find((player) => player.admin) != null) {
		return;
	}
	var copie = []; 
	players.forEach(function(element) { copie.push(element.id); });
	room.setPlayerAdmin(arrayMin(copie), true); // Give admin to the player who's played the longest on the room
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
                room.stopGame();
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
	updateTeams();
	updateAdmins();
    extendedP.push([player.id, player.auth, player.conn, false, 0, 0, false]);
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
	if (getAFK(changedPlayer)) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		room.sendChat(changedPlayer.name + " is AFK !");
		return;
	}
	if (room.getScores() != null) {
		var scores = room.getScores();
		if (changedPlayer.team != Team.SPECTATORS && scores.time <= (3/4) * scores.timeLimit  && Math.abs(scores.blue - scores.red) < 2) {
			(changedPlayer.team == Team.RED) ? allReds.push(changedPlayer) : allBlues.push(changedPlayer);
		}
	}
	if (changedPlayer.team == Team.SPECTATORS) {
		setActivity(changedPlayer, 0);
	}
	updateTeams();
}

room.onPlayerLeave = function(player) {
	updateTeams();
	updateAdmins();
    setActivity(player, 0);
    if (players.length == maxTeamSize * 2 - 1) {
        allReds = [];
        allBlues = [];
    }
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
	ban == true ? banList.push([kickedPlayer.name, kickedPlayer.id]) : null;
}

/* PLAYER ACTIVITY */

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	player.team != Team.SPECTATORS ? setActivity(player, 0) : null;
	if (["!help"].includes(message[0].toLowerCase())) {
		room.sendChat("[PV] Player commands : !register <pw>, !me, !games, !wins, !goals, !assists, !cs. PW must be > 4 characters.", player.id);
		player.admin ? room.sendChat("[PV] Admin : !mute <team> <position> <duration = 3>, !unmute all/<nick>, !clearbans <number = all>, !slowmode <duration>, !endslow", player.id) : null;
	}
	else if (["!afk"].includes(message[0].toLowerCase())) {
		if (room.getScores() != null && player.team != Team.SPECTATORS) {
			room.sendChat("You can't go AFK while you're in a game !", player.id);
			return false;
		}
		setAFK(player, !getAFK(player));
		room.sendChat(player.name + getAFK(player) ? " is now AFK !" : "is not AFK anymore !");
		updateTeams();
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
		room.sendChat("[PV] " + player.name + "> Game: " + stats[0] + ", Win: " + stats[1] + ", Draw: " + stats[2] + ", Loss: " + stats[3] + ", WR: " + stats[4] + "%, Goal: " + stats[5] + ", Assist: " + stats[6] + ", GK: " + stats[7] + ", CS: " + stats[8] + ", CS%: " + stats[9] + "%", player.id	);
	}
	else if (["!games"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[0])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Games> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!wins"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[1])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Wins> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!goals"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[5])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Goals> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!assists"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[6])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] Assists> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!cs"].includes(message[0].toLowerCase())) {
		var tableau = [];
		Object.keys(localStorage).forEach(function(key) { if (!["player_name", "view_mode", "geo", "avatar", "player_auth_key"].includes(key)) { tableau.push([(JSON.parse(localStorage.getItem(key))[10]),(JSON.parse(localStorage.getItem(key))[8])]); } });
		if (tableau.length < 5) {
			room.sendChat("[PV] Not enough games played yet.", player.id);
			return false;
		}
		tableau.sort(function(a, b) { return b[1] - a[1]; });
		room.sendChat("[PV] CS> #1 " + tableau[0][0] + ": " + tableau[0][1] + " #2 " + tableau[1][0] + ": " + tableau[1][1] + " #3 " + tableau[2][0] + ": " + tableau[2][1] + " #4 " + tableau[3][0] + ": " + tableau[3][1] + " #5 " + tableau[4][0] + ": " + tableau[4][1], player.id);
	}
	else if (["!claim"].includes(message[0].toLowerCase())) {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
			adminPassword = 100 + getRandomInt(900);
			console.log("adminPassword : " + adminPassword);
		}
	}
	else if (["!mute"].includes(message[0].toLowerCase())) {
		if (player.admin) {
			if (message.length == 3 || message.length == 4) {
				if (["R","B","S"].includes(message[1])) {
					var timeOut;
					if (message[1] == "R") {
						if (!Number.isNaN(Number.parseInt(message[2]))) {
							if (Number.parseInt(message[2]) <= teamR.length && Number.parseInt(message[2]) > 0) {
								if (teamR[Number.parseInt(message[2]) - 1].admin || getMute(teamR[Number.parseInt(message[2]) - 1])) {
									return false;
								}
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
								setTimeout(function(player) { setMute(player, false); }, timeOut, teamR[Number.parseInt(message[2]) - 1]);
								setMute(teamR[Number.parseInt(message[2]) - 1], true);
								room.sendChat(teamR[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
							}
						}
					}
					if (message[1] == "B") {
						if (!Number.isNaN(Number.parseInt(message[2]))) {
							if (Number.parseInt(message[2]) <= teamB.length && Number.parseInt(message[2]) > 0) {
								if (teamB[Number.parseInt(message[2]) - 1].admin || getMute(teamB[Number.parseInt(message[2]) - 1])) {
									return false;
								}
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
								setTimeout(function(player) { setMute(player, false); }, timeOut, teamB[Number.parseInt(message[2]) - 1]);
								setMute(teamB[Number.parseInt(message[2]) - 1], true);
								room.sendChat(teamB[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
							}
						}
					}
					if (message[1] == "S") {
						if (!Number.isNaN(Number.parseInt(message[2]))) {
							if (Number.parseInt(message[2]) <= allTeamS.length && Number.parseInt(message[2]) > 0) {
								if (allTeamS[Number.parseInt(message[2]) - 1].admin || getMute(allTeamS[Number.parseInt(message[2]) - 1])) {
									return false;
								}
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
								setTimeout(function(player) { setMute(player, false); }, timeOut, allTeamS[Number.parseInt(message[2]) - 1]);
								setMute(allTeamS[Number.parseInt(message[2]) - 1], true);
								room.sendChat(allTeamS[Number.parseInt(message[2]) - 1].name + " has been muted for " + (timeOut/60000) + " minutes!");
							}
						}
					}
				}
			}
		}
    }
    else if (["!unmute"].includes(message[0].toLowerCase())) {
		if (player.admin) {
			if (message.length == 2 && message[1] == "all") {
				extendedP.forEach((ePlayer) => { ePlayer[eP.MUTE] = false; });
				room.sendChat("Mutes cleared.");
			}
			if (message.length >= 2) {
				var name = "";
				for (var i = 1 ; i < message.length ; i++) {
					name += message[i] + " ";
				}
				name = name.substring(0, name.length - 1);
				allPlayers.filter((p) => p.name == name).length > 0 ? room.sendChat(name + " has been unmuted.") : null;
				allPlayers.filter((p) => p.name == name).forEach((element) => { setMute(element, false); });
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
						return;
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
		if (player.admin) {
			if (banList.length == 0) {
				room.sendChat("[PV] There's nobody in the Ban List !", player.id);
				return false;
			}
			var cstm = "[PV] Ban List : ";
			for (var i = 0 ; i < banList.length ; i++) {
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
	else if (["!bb, !bye, !cya, !gn"].includes(message[0].toLowerCase())) {
		room.kickPlayer(player.id, "Bye !", false);
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
    GKList = [];
    countAFK = true;
	activePlay = false;
    Rposs = 0;
	Bposs = 0;
	lastPlayersTouched = [null, null];
	allReds = [];
	allBlues = [];
	goldenGoal = false;
	endGameVariable = false;
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
}

room.onGameStop = function(byPlayer) {
    if (byPlayer.id == 0 && endGameVariable) {
		updateTeams();
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
        setTimeout(() => { topBtn(); }, 100);
    }
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
    const scores = room.getScores();
	game.scores = scores;
    activePlay = false;
    countAFK = false;
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
	if (scores.scoreLimit != 0 && (scores.red == scores.scoreLimit || scores.blue == scores.scoreLimit || goldenGoal == true)) {
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
	updateAdmins();
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
