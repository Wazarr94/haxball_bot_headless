/** COMMENTARY

To implement the buttons, we need to get the team of each player and his position on the team.
Then we can code the button functions.

1.1 UPDATE : 

Upgraded code efficiency and minor fixes
Added the swap button
Added different versions for some buttons, my version of the button and the official version. Ex: resetOffBtn is the official haxball version of the button, while resetBtn is my version.

Explanation of my versions:
redToSpecBtn : To be more fair, the order have been reversed. For instance, the 4th player of the red team will be higher in the spec list than the 1st one.
blueToSpecBtn : See above
resetBtn : This reset button focuses on the position on their team rather than the team itself. The priority is given to the blue team.
Example: Red Team [a, c, e, g], Blue Team [b, d, f]. My reset button gives the following spec team : [g, f, e, d, c, b, a].

*/

/* VARIABLES */

/* PLAYERS */

var players;
var teamR;
var teamB;
var teamS;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // returns a random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

/* BUTTONS */

function topBtn() {
    if (teamS.length > 0) {
        if (teamR.length == teamB.length && teamS.length > 1) {
            room.setPlayerTeam(teamS[0].id, Team.RED);
            room.setPlayerTeam(teamS[1].id, Team.BLUE);
        }
        else if (teamR.length < teamB.length) room.setPlayerTeam(teamS[0].id, Team.RED);
        else room.setPlayerTeam(teamS[0].id, Team.BLUE);
    }
}

function randomBtn() {
    if (teamS.length > 0) {
        if (teamR.length == teamB.length && teamS.length > 1) {
            var r = getRandomInt(teamS.length);
            room.setPlayerTeam(teamS[r].id, Team.RED);
            teamS = teamS.filter((spec) => spec.id != teamS[r].id);
            room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.BLUE);
        }
        else if (teamR.length < teamB.length) room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.RED);
        else room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id, Team.BLUE);
    }
}

function blueToSpecBtn() {
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
	}
}

function blueToSpecOffBtn() {
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[i].id, Team.SPECTATORS);
	}
}

function redToSpecBtn() {
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
	}
}

function redToSpecOffBtn() {
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[i].id, Team.SPECTATORS);
	}
}

function resetBtn() {
    for (i = 0; i < Math.max(teamR.length, teamB.length); i++) {
        if (Math.max(teamR.length, teamB.length) - teamR.length - i > 0) room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
        else if (Math.max(teamR.length, teamB.length) - teamB.length - i > 0) room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
        else break;
    }
    for (i = 0; i < Math.min(teamR.length, teamB.length); i++) {
        room.setPlayerTeam(teamB[Math.min(teamR.length, teamB.length) - 1 - i].id, Team.SPECTATORS);
        room.setPlayerTeam(teamR[Math.min(teamR.length, teamB.length) - 1 - i].id, Team.SPECTATORS);
    }
}

function resetOffBtn() {
	blueToSpecOffBtn();
	redToSpecOffBtn();
}

function swapBtn() {
    for (i = 0; i < Math.max(teamR.length, teamB.length); i++) {
        if (teamR.length - i > 0) room.setPlayerTeam(teamR[i].id, Team.BLUE);
        if (teamB.length - i > 0) room.setPlayerTeam(teamB[i].id, Team.RED);
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
	updateTeams();
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	updateTeams();
}

room.onPlayerLeave = function(player) {
	updateTeams(); // After this line, if you try to access the player's properties, the room will crash whenever someone leaves
}
