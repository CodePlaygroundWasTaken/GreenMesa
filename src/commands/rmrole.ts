const xlg = require("../xlogger");
const { getGlobalSetting, getGuildSetting } = require("../dbmanager");
const { stringToRole } = require('../utils/parsers');
const { permLevels } = require('../permissions');

module.exports = {
    name: "rmrole",
    description: "remove a role",
    usage: "<@role>",
    args: true,
    permLevel: permLevels.admin,
    category: "moderation",
    async execute(client, message, args) {
        try {
            let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }

            if (!stringToRole(message.guild, args.join(" "), false, false)) {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                        description: `Invalid role`
                    }
                });
                return false;
            }
            var target = stringToRole(message.guild, args.join(" "), false, false);
            await target.delete();
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('success_embed_color'))[0].value),
                    description: `Role removed successfully`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, "Failure removing role");
            return false;
        }
    }
}