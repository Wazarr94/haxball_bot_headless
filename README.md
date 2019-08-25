# HaxBot

This project has been designed to help people who do not know how to code to be able to host a room with multiple options.
It currently contains 5 levels, which all have their own specifications.

## Level 0

It's the skeleton for the bot, if you want to start building your own bot, it's what you need to start your project. Only use this if you plan to code your own bot, it contains every events needed for building a good bot.
It doesn't contain the event onTeamVictory since it's not useful and pretty restrictive.

## Level 1

This level is the minimum we can expect from a haxball headless bot.

 - Updating teams
 - Giving admin when there's a need of them
 - Join, time, goal and win notifications

And finally I added the ball speed, which is pretty cool. I'd recommand this level to people who wants to have a minimalist bot.

## Level 2

This level adds some pretty cool features.

 - Possession
 - GK of each team
 - Admins options : mute system and clearbans

I recommend this over the Level 1 bot since it's still handy to use. The next levels will be more advanced.

## Level 3

This is where the more interesting stuff starts. Check the changelist below :

 - **Global** statistics system with login
 - Inactivity handler
 - AFK system
 - Admin options : clearing specific bans via the ban list, slow mode

These are pretty heavy changes. If you're interested in getting this bot (or the Level 4 bot), check out the Global Statistics System below. I recommand getting this bot if you're interested in having global statistics and still want to have people handling the room. 

## Level 4

This is the final level, the bot becomes self sufficient :

 - End game handler
 - Choose system

That's it ! Choose this level if you want to have a very advanced room and don't want to handle the basic things.

# Bot systems

## Global statistics

The statistics are saved in the localStorage as follows:

`"Auth": ["0-Games", "1-Wins", "2-Losses", "3-Goals", "4-Assists", "5-GK", "6-CS", "7-Role", "8-Nick"]`

The role corresponds to your rank in the room which can be: "player", "moderator", "admin", "master".
The nickname is the nickname with which you got your first statistics.

Incoming changes : 

  - Being able to change nickname
  - Switching from localStorage to indexedDB, better for many reasons
  - The possibility to connect your account to a Discord server and the possibility to connect an account to another (in case of clearance of cache/new computer/whatever)

## Choosing

I am happy with my choosing system and I genuinely think it's the best one. Once you know how it works, it's really easy to use, especially since some nicknames are fancy. Here's how it works.

The captain choosing is the one who has the less players. In case of an equality, the red captain chooses first.

The captain whose turn it is to choose receives a line of instructions and a list of available players.
This one is of the following form: 

`[PV] Players: Paul[1], Zidane[2], Margueritedu62[3], xxKevin[4].`

To choose top, random or bottom, just enter top, random or bottom. 
To select a player specifically, simply enter the number associated with him/her. So to choose Zidane, the captain enters 2.
After choosing, the captain whose turn it is receives the instruction line and an updated list of players. 
Thus, he would receive:

`[PV] Players: Paul[1], Margueritedu62[2], xxKevin[3].`

And we choose until the teams are balanced. Also, make sure no one moves the players manually, or the bot would not work properly.

# State of the project

This project has been quite popular on the haxball scene, I've seen many rooms using the level 4 bot.

In parallel with another project, and a possible withdrawal from haxball, I am going to rework the project. The level system might have been confusing and I'll probably change the structure a bit, not much though. In the end, it'll the same thing with different names.

In the following days, expect an update with new features, improved code. During the time I wasn't active, I was doing other bots, so a lot of fixes have been done, but not released.

In any case, if you have an issue, submit one in the issues tab. If you have experience in JS and want to help, send a DM at `@Gouiri#9550`.


