// NOTE: The discord.js client.uptime variable seems to be unreliable for this bot and there is a to-do list item that has not been completed to fix that.
// At startup (in bot.js) the bot would create a Date() and subtract when this command is executed to get uptime.

import fs from 'fs';
import { Command } from 'src/gm';
import config from '../../auth.json';
import { getFriendlyUptime } from '../utils/time';
import xlg from '../xlogger';

export const command: Command = {
    name: 'uptime',
    description: {
        short: 'see how long the bot has been alive',
        long: 'How long the bot has been alive (doesn\'t mean healthy)'
    },
    aliases: ['lifetime'],
    async execute(client, message) {
        try {
            if (!client.uptime) {
                client.specials?.sendError(message.channel, "Uptime currently unavailable, sorry");
                return;
            }
            if (!config.longLife || config.longLife < client.uptime) config.longLife = client.uptime;
            fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
                if (err) return console.log(err);
            });

            const uptime = getFriendlyUptime(client.uptime, true);

            message.channel.send({
                embed: {
                    "title": "Bot Lifetime",
                    "description": 'How long the bot has been alive (doesn\'t mean healthy)',
                    "fields": [
                        {
                            "name": "Elapsed Time",
                            "value": `\`${uptime.d} : ${uptime.h} : ${uptime.m} ; ${uptime.s} . ${uptime.ms}\ndays  hrs  min  sec  ms \``,
                            "inline": true
                        },
                        {
                            "name": "Chronometer",
                            "value": client.uptime + 'ms',
                            "inline": true
                        },
                        {
                            "name": "Bot Started At",
                            "value": new Date(client.readyTimestamp || 0).toUTCString()
                        },
                        {
                            "name": "Longest Lifetime",
                            "value": config.longLife + 'ms (updates every 20 seconds when idle)'
                        }
                    ]
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

