const moment = require('moment');
const { getTop10, getXP, getGlobalSetting } = require("../dbmanager");

function getJoinRank(ID, guild) { // Call it with the ID of the user and the guild
    if (!guild.member(ID)) return; // It will return undefined if the ID is not valid

    let arr = guild.members.cache.array(); // Create an array with every member
    arr.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp); // Sort them by join date

    for (let i = 0; i < arr.length; i++) { // Loop though every element
        if (arr[i].id == ID) return i; // When you find the user, return it's position
    }
}

function getOrdinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function getPresenceEmoji(target) {
    if (target.user.presence.status === 'online') return '<:736903507436896313:752118506950230067>';
    if (target.user.presence.status === 'idle') return '<:736903574235250790:752118507164139570>';
    if (target.user.presence.status === 'dnd') return '<:736903662617755670:752118507046699079>';
    if (target.user.presence.status === 'offline') return '<:736903819509628948:752118507260477460>';
    if (target.user.presence.activities.length && target.user.presence.activities[0].type === 'streaming') return '<:736903745245413386:752118507248025641>';
}

module.exports = {
    name: 'userinfo',
    description: 'get info on any member',
    aliases: ['user', 'me', 'member', 'memberinfo'],
    cooldown: 8,
    async execute(client, message, args) {
        let target = message.mentions.members.first() || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[0]) : false) || message.member;
        let rank = await getTop10(target.guild.id, target.id);
        let xp = await getXP(target);

        var roles = '';
        var roleArray = target.roles.cache.array();
        var roleCount = target.roles.cache.array().length - 1;
        roleArray.pop();
        for (const role of roleArray.slice(0, 40)) {
            roles += role.toString() + ' ';
        }
        if (roleArray.length > 40) roles += `and ${roleCount - 40} more`;
        if (roles.length == 0) {
            roles = 'no roles';
        }

        let joinedAt = moment(target.joinedAt).utc();
        let createdAt = moment(target.user.createdTimestamp).utc();

        // get join rank of member
        var joinRank = getJoinRank(target.id, target.guild) + 1;
        if (joinRank == 1) {
            joinRank = 'oldest member';
        } else {
            joinRank = getOrdinalSuffix(joinRank) + ' member joined';
        }
        
        message.channel.send({
            embed: {
                color: target.roles.hoist ? target.roles.hoist.color : parseInt((await getGlobalSetting('info_embed_color'))[0].value) || 0,
                author: {
                    name: `Stats of ${target.user.tag} ${rank.personal ? rank.personal.rank == 1 ? "🥇" : rank.personal.rank == 2 ? "🥈" : rank.personal.rank == 3 ? "🥉" : "" : ''}`,
                    icon_url: target.user.displayAvatarURL()
                },
                thumbnail: {
                    url: target.user.displayAvatarURL()
                },
                fields: [
                    {
                        "name": "Status",
                        "value": `${getPresenceEmoji(target)} ${target.user.presence.status || ''}`,
                        "inline": true
                    },
                    {
                        name: 'Join Rank',
                        value: joinRank,
                        inline: true
                    },
                    {
                        name: 'Nitro Boosting',
                        value: `${target.premiumSince ? `since ${moment(target.premiumSince).format('ddd M/D/Y HH:mm:ss')}` : 'no'}`,
                        inline: true
                    },
                    {
                        name: 'Joined',
                        value: `${joinedAt.format('ddd M/D/Y HH:mm:ss')}\n(${joinedAt.fromNow()})`,
                        inline: true
                    },
                    {
                        name: 'Created',
                        value: `${createdAt.format('ddd M/D/Y HH:mm:ss')}\n(${createdAt.fromNow()})`,
                        inline: true
                    },
                    {
                        name: 'Rank & Level (xp)',
                        value: `#${rank.personal ? rank.personal.rank : 'none'} | ${xp[0] ? xp[0].level : 'none'}`,
                        inline: true
                    },
                    {
                        "name": `Roles [${roleCount}]`,
                        "value": roles
                    }
                ],
                footer: {
                    text: 'All dates in UTC'
                }
            }
        })
    }
}