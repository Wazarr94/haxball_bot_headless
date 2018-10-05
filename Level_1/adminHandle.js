/** COMMENTARY 

2 things in this file : the updateAdmins function which allow to keep an admin anytime, and the adminPassword.
First thing is much wanted if you plan to have your room going while you're away.
The second one makes it so if you accidentaly lose your admin, you'll need a way to recover it. The password will show up in the console.

*/

/* ROOM */

var adminPassword = 1000 + getRandomInt(9000);
console.log("adminPassword : " + adminPassword);

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // Returns a random number from 0 to max-1
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

/* PLAYER FUNCTIONS */

function updateAdmins() {
	if (players.length == 0 || players.find((player) => player.admin) != null) {
		return;
	}
	var copie = []; 
	players.forEach(function(element){ copie.push(element.id); });
	room.setPlayerAdmin(arrayMin(copie), true); // Give admin to the player who's played the longest on the room
}

/* EVENTS */

room.onPlayerJoin = function(player) {
	updateAdmins();
}

room.onPlayerLeave = function(player) {
	updateAdmins();
}

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	if (message[0] == '!claim') {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
		}
	}
	if (message[0][0] == "!") { // Make sure this condition stays at the bottom of this function
		return false;
	}
}
