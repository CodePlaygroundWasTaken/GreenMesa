const moment = require('moment');
const { getGlobalSetting } = require("../dbmanager");
//const { getDayDiff } = require('../utils/time');
const xlg = require("../xlogger");

module.exports = {
    name: 'serverinfo',
    description: 'get info on the current server',
    aliases: ['server'],
    guildOnly: true,
    cooldown: 8,
    async execute(client, message) {
        let createdAt = moment(message.guild.createdAt).utc();
        var memberCount = message.guild.memberCount;
        var botCount = message.guild.members.cache.filter(member => member.user.bot).size;
        message.channel.send({
            embed: {
                "color": parseInt((await getGlobalSetting('info_embed_color'))[0].value),
                "footer": {
                    "text": "ID: " + message.guild.id + ' | Region: ' + message.guild.region + ' | All dates in UTC'
                },
                "thumbnail": {
                    "url": message.guild.iconURL()
                },
                "author": {
                    "name": message.guild.name,
                    "icon_url": message.guild.iconURL()
                },
                "fields": [
                    {
                        "name": "Owner",
                        "value": message.guild.owner.toString(),
                        "inline": true
                    },
                    {
                        "name": "Members",
                        "value": `:slot_machine: ${memberCount}\n👥 ${memberCount - botCount}\n🤖 ${botCount}`,
                        "inline": true
                    },
                    {
                        "name": "Online <:736903507436896313:752118506950230067>",
                        "value": `${message.guild.members.cache.filter(member => member.presence.status == 'online' && !member.user.bot).size} human`,
                        "inline": true
                    },
                    {
                        "name": `Channels (${message.guild.channels.cache.array().length})`,
                        "value": `Categories: ${message.guild.channels.cache.filter(x => x.type == 'category').size}\nText: ${message.guild.channels.cache.filter(x => x.type == 'text').size}\nVoice: ${message.guild.channels.cache.filter(x => x.type == 'voice').size}`,
                        "inline": true
                    },
                    {
                        "name": "Roles",
                        "value": message.guild.roles.cache.size,
                        "inline": true
                    },
                    {
                        "name": "Created",
                        "value": `${createdAt.format('ddd M/D/Y HH:mm:ss')}\n(${createdAt.fromNow()})`,
                        "inline": true
                    }
                ]
            }
        }).catch(xlg.error);
    }
}