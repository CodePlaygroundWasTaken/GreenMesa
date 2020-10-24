const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const { stringToChannel } = require('../utils/parsers');
const { permLevels } = require('../permissions');

module.exports = {
    name: "cpchan",
    description: "copy a channel",
    usage: "<channel id>",
    args: true,
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                description: `in dev`
            }
        }).catch(xlg.error);
        if (!message.guild.channels.cache.get(args[0])) {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    description: `Not a valid channel`
                }
            }).catch(xlg.error);
        }
        let target = stringToChannel(message.guild, args.join(" "), true, true);
        message.guild.channels.create(target);
    }
}