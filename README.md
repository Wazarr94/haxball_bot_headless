# HaxBot

## Description

This project has been designed to help people who do not know how to code to be able to host a room with multiple options.

This is a new version, which capitalizes on the latest Haxball update that notably introduced the `noPlayer` option.

The files of the last version are still accessible, along with the README file in the OLD folder. Their use is discouraged.

## How to use

Download the project or the script you want to use on your computer.

For editing the code, I highly recommand the use of Visual Studio Code as it is a very complete IDE. You will need it to change the room options.

The options are at the top of the code, and they are numerous. For example, you can set the name of the room, add a headless token, change the default stadiums, edit the team size for the public room, etc.

## Running the script

### Local machine:

1. Open the [Haxball headless page](https://www.haxball.com/headless)
2. Open devtools using F12 and select the console
3. Copy and paste the content of the script of your choice
4. If you haven't added a headless token from the [token page](https://www.haxball.com/headlesstoken), complete the captcha
5. The room is now open, press Ctrl + Click to open it (keep the headless room tab open)


### VPS:

My recommandation for when you are using a server is to use Ubuntu 18.04 as it is both cheaper and more powerful for hosting rooms.
If you are not familiar with Linux, you can always use Windows and the same method as for a local machine. For Ubuntu, use the following method:

1. Install haxroomie by entering in the terminal:
```bash
bash <(curl -s https://raw.githubusercontent.com/morko/haxroomie/master/scripts/install-haxroomie-cli-debian.sh)
```
Keep the default options and enter a password when prompted

2. Run haxroomie once by entering haxroomie in the terminal and immediately exit by pressing `q`

3. Upload your script to the VPS, and remember its path

4. Enter:
```bash
nano /home/haxroomie/.haxroomie/config.js
```
and press Ctrl + K until the file is empty. Then paste the following script:

```js
let config = {
    room1: {
        autoStart: true,
        roomName: 'YOUR ROOM NAME HERE',
        maxPlayers: 16,
        public: true,
        noPlayer: true,
        token: 'YOUR TOKEN HERE',
        roomScript: '/path/file/Haxbot_public.js',
    },
};

module.exports = config;
```

Don't forget to change the roomName, maxPlayers, public, token and roomScript options accordingly.

Then, press Ctrl + X, Enter and Enter to save the file.

5. Enter haxroomie in the terminal to launch the room. Enter min to minimize the process and close the terminal. Your room is open.

For more details about haxroomie, check out their website [here](https://morko.github.io/haxroomie/tutorial-haxroomie-cli-config.html).

## Functionalities

There are 2 files in this repository, and they have the same core of functionalities, which are the following:

- Advanced statistics
- Discord integration
- Team chat and player chat
- Goal notification with shot speed
- Auto game recording
- Admin system
- Ban system

and much more!

To discover all the features of the bot, use the command `!help` to check all commands. To go into the details of a command, type `!help <command>`.

### Versions

There are 2 files, based on whether you want your room to be public or not.

The private file is when there are no restrictions set in place and lets admins do everything.

For the public version, the bot handles setting up the teams correctly, and captains are able to pick their teams thanks to the choosing system, which remained the same as in the previous version.

## Personalisation

### File

To personalise the file, there are multiple steps to follow.

First, you are going to need the most obvious details, such as the room name, the number of players in the room, or the fact that the room is public or not. If your room isn't public, you can set maxPlayers at 40.

If you need to translate, search for `room.sendAnnouncement` in the file, and modify the text that follows in your language. For an accurate translation, I recommend using [DeepL](https://www.deepl.com).

### Link to Discord

Here are the steps to follow to link your room to Discord. It will give you the logs of your room and match reports for all matches played in your room.

1. Create your Discord server or use one where you have admin rights.
2. Create a log channel and a game channel.
3. For each channel, create a [webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) and copy their links.
4. Replace `roomWebhook` by the webhook link of your log channel.
5. Replace `gameWebhook` by the webhook link of your game channel.
6. You have linked your room with Discord!

Once everything is setup, you will be able to check everything that happens in your room, as well as beautiful reports of all games played.

## Feedback

If you encounter any bug while using the bot, please file an issue with the complete console error message. Any incomplete issue will not be addressed.

Feel free to leave any suggestions in the Issues tab as well, and I will try to respond to them if I have time to spend on the project.

If you enjoy the bot, consider giving it a star to show your appreciation.