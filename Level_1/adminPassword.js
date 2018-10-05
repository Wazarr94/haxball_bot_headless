/** COMMENTARY 

If you accidentaly lose your admin, you'll need a way to recover it.

*/

/* ROOM */

var adminPassword = 1000 + getRandomInt(9000);
console.log("adminPassword : " + adminPassword);

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // Returns a random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

/* EVENTS */

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
