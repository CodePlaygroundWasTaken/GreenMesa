const { getGlobalSetting, getXP, setSpideySaved } = require("../dbmanager");
const xlg = require("../xlogger");
//const moment = require("moment");
const { permLevels } = require('../permissions');
const { sendError } = require("../utils/specialmsgs");

module.exports = {
    name: 'spiderman',
    aliases: ['spidey'],
    description: 'ask spiderman for help',
    category: 'misc',
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message) {
        try {
            const xpInfo = await getXP(message.member);
            xlg.log(new Date(xpInfo[0].spideySaved))
            if (xpInfo && xpInfo[0].spideySaved && xpInfo[0].spideySaved !== null && new Date(xpInfo[0].spideySaved)) {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("darkred_embed_color"))[0].value, 10),
                        description: '<:spidey_face:754750502083887165>: [everybody gets one](https://digmsl.link/3nn2WFX)'
                    }
                });
                return true;
            }
            const savedRes = await setSpideySaved(message.member);
            if (!savedRes) {
                await sendError(message.channel, "**error**, Spiderman was unavailable :/")
                return false;
            }
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("darkred_embed_color"))[0].value, 10),
                    title: "<:spidey_face:754750502083887165> :spider_web:",
                    description: "Spiderman saves you"
                }
            });
            return true;
        } catch (error) {
            xlg.error(error);
            await sendError(message.channel);
            return false;
        }
    }
}