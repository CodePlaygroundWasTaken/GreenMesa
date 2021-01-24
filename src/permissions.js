const xlg = require("./xlogger");
const { getGlobalSetting, getXP, getGuildSetting } = require("./dbmanager");
const { GuildMember } = require("discord.js");

const permLevels = {
    member: 0,
    trustedMember: 1,
    immune: 2,
    mod: 3,
    admin: 4,
    botMaster: 5,
}

async function getPermLevel(member) {
    if (member == null || !(member instanceof GuildMember)) {
        return permLevels.member;
    }
    let botmasters = await getGlobalSetting("botmasters").catch(xlg.error);
    botmasters = botmasters[0].value.split(',');
    if (botmasters.includes(member.user.id)) {
        return permLevels.botMaster;
    }
    if (!member.guild) {
        return permLevels.member;
    }
    if (member.hasPermission('ADMINISTRATOR')) { // if a user has admin rights he's automatically a admin
        return permLevels.admin;
    }
    const modrole = await getGuildSetting(member.guild, "mod_role");
    if (modrole && modrole[0]) {
        if (member.roles.cache.has(modrole[0].value)) {
            return permLevels.mod;
        }
    }
    const memberXP = await getXP(member)
    if (memberXP && memberXP.length && memberXP[0].level > 0) {
        return permLevels.trustedMember;
    }
    return permLevels.member;
}

exports.permLevels = permLevels;
exports.getPermLevel = getPermLevel;
