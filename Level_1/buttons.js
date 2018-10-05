/** COMMENTARY

To implement the buttons, we need to get the team of each player and his position on the team.
Then we can code the button functions. I decided to reverse the order for the BlueToSpecBtn and the RedToSpecBtn because it's more fair this way.
You can revert it if you want, I detailed how to do it.

*/

/* VARIABLES */

/* PLAYERS */

var players;
var teamR;
var teamB;
var teamS;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // return random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
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
		room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS); // If you want the classic order of putting back the players, replace '[teamB.length - 1 - i]' by '[i]'
	}
}

function redToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS); // If you want the classic order of putting back the players, replace '[teamR.length - 1 - i]' by '[i]'
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

/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList().filter((player) => player.id != 0);
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
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
	updateTeams(); // This order is important, if you invert this line with the one above, this will crash the room anytime someone leaves
}
