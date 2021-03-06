import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";
//import { getTwitchSubsGuild, getGlobalSetting } from "../dbmanager";
//const { twitchIDLookup } = require("../website/routes/twitch");

export const command: Command = {
    name: "listtwitch",
    aliases: ["lstwitch"],
    description: {
        short: "list twitch subscriptions",
        long: "Get all of the Twitch streamers your server is subscribed to."
    },
    permLevel: permLevels.member,
    guildOnly: true,
    ownerOnly: false,
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const subs = await client.database?.getTwitchSubsGuild(message.guild.id);
            if (!subs) {
                client.specials?.sendError(message.channel, "No subscriptions found.");
                return false;
            }

            const streamers = subs.map((s) => {
                const name = s.streamerlogin || s.streamerid;
                const chan = message.guild?.channels.cache.get(s.channelid);
                if (name) {
                    return `• [${name}](https://twitch.tv/${name})${(chan && chan.id) ? ` ${chan}` : ''}`
                }
            })

            const iec = await client.database?.getColor("info_embed_color");
            message.channel.send({
                embed: {
                    color: iec,
                    title: "Twitch Subscriptions",
                    description: `${streamers.join("\n")}\n`
                }
            })
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

