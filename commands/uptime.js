// NOTE: The discord.js client.uptime variable seems to be unreliable for this bot and there is a to-do list item that has not been completed to fix that.
// At startup (in bot.js) the bot would create a Date() and subtract when this command is executed to get uptime.

const fs = require('fs');
const config = require('../auth.json');

module.exports = {
    name: 'uptime',
    description: 'Get information about bot lifetime and history',
    aliases: ['lifetime'],
    async execute(client, message) {
        if (!config.longLife || config.longLife < client.uptime) config.longLife = client.uptime;
        fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });

        let allSeconds = (client.uptime / 1000);
        let days = Math.floor(allSeconds / 86400);
        let hours = Math.floor((allSeconds / 3600) - (days * 24));
        allSeconds %= 3600;
        let minutes = Math.floor(allSeconds / 60);
        let seconds = Math.floor(allSeconds % 60);
        let milliseconds = Math.floor(((allSeconds % 60) * 1000) - (seconds * 1000));
        if (days < 10) {
            days = "00" + days;
        } else if (days < 100) {
            days = "0" + days;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        message.channel.send({
            embed: {
                "title": "Bot Lifetime",
                "description": {
                    short: 'see how long the bot has been alive',
                    long: 'How long the bot has been alive (doesn\'t mean healthy)'
                },
                "fields": [
                    {
                        "name": "Elapsed Time",
                        "value": `\`${days} : ${hours} : ${minutes} ; ${seconds} . ${milliseconds}\ndays  hrs  min  sec  ms \``,
                        "inline": true
                    },
                    {
                        "name": "Chronometer",
                        "value": client.uptime+'ms',
                        "inline": true
                    },
                    {
                        "name": "Bot Started At",
                        "value": new Date(client.readyTimestamp).toUTCString()
                    },
                    {
                        "name": "Longest Lifetime",
                        "value": config.longLife + 'ms (updates every 20 seconds when idle)'
                    }
                ]
            }
        }).catch(console.error);
    }
}