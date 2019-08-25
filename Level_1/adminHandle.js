/** COMMENTARY 

2 things in this file : the updateAdmins function which allow to keep an admin anytime, and the adminPassword.
First thing is much wanted if you plan to have your room going while you're away.
The second one makes it so if you accidentally lose your admin, you can recover it. The password will show up in the console.

1.1 UPDATE :
When an admin unadmins himself while he's the only admin, he's not going to get admin back immidiately.
Also fixed the possibility there are no admins in the room in case the only admin unadmins himself. 

*/

/* ROOM */

var players;

var adminPassword = 1000 + getRandomInt(9000);
console.log(`adminPassword : ${adminPassword}`);

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // returns a random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function arrayMin(arr) {
	var len = arr.length;
	var min = Infinity;
	while (len--) {
		if (arr[len] < min) min = arr[len];
	}
	return min;
}

/* PLAYER FUNCTIONS */

function updateAdmins(excludedPlayerID = null) {
	if (players.length != 0 && players.find((p) => p.admin) == null) {
		if (excludedPlayerID != null) {
			let playerArray = players.filter((p) => p.id != excludedPlayerID);
			let arrayID = playerArray.map((player) => player.id);
			room.setPlayerAdmin(arrayMin(arrayID), true);
		}
		else {
			let arrayID = players.map((player) => player.id);
			room.setPlayerAdmin(arrayMin(arrayID), true);
		}
	}
}

/* EVENTS */

room.onPlayerJoin = function(player) {
	players = room.getPlayerList().filter((p) => p.id != 0);
	updateAdmins();
}

room.onPlayerLeave = function(player) {
	players = room.getPlayerList().filter((p) => p.id != 0);
	updateAdmins();
}

room.onPlayerChat = function(player, message) {
	message = message.split(/ +/);
	if (["!claim"].includes(message[0].toLowerCase())) {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
		}
	}
	if (message[0][0] == "!") { // Make sure this condition stays at the bottom of this function
		return false;
	}
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
	updateAdmins(changedPlayer.admin == false && changedPlayer.id == byPlayer.id ? changedPlayer.id : null);
}
