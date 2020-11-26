const mysql = require("mysql");
const { db_config } = require("./auth.json");
const xlog = require("./xlogger");
const moment = require("moment");
const util = require('util');
const Discord = require('discord.js');
let conn;
const levelRoles = [
    {
        level: 70,
        name: 'no-life',
        color: '#9F2292'
    },
    {
        level: 60,
        name: 'Active x10⁹⁹',
        color: '#943246'
    },
    {
        level: 50,
        name: 'Super Hyper Active Member',
        color: '#3F62CC'
    },
    {
        level: 40,
        name: 'Hyper Active Member',
        color: '#1F8B4B'
    },
    {
        level: 25,
        name: 'Very Active Member',
        color: '#BA342A'
    },
    {
        level: 10,
        name: 'Active Member',
        color: '#BB3DA8'
    },
    {
        level: 5,
        name: 'prob not a bot level',
        color: '#a886f1'
    },
    {
        level: 1,
        name: 'noob level',
        color: '#99AAB1'
    }
]

function handleDisconnect() {
    conn = mysql.createConnection(db_config);
    conn.connect(function(err) {
        if (err) {
            xlog.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
            return;
        }
        xlog.log("Connected to database");
    });
    conn.on('error', function(err) {
        //console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

const query = util.promisify(conn.query).bind(conn);

/**
 * query and retrieve values from the globalsettings table
 * @param {string} name name of setting to retrieve
 */
async function getGlobalSetting(name) {
    let rows = await query(`SELECT * FROM globalsettings WHERE name = ${mysql.escape(name)}`).catch(xlog.error);
    if (rows && rows.length > 0) {
        return rows;
    } else {
        return false;
    }
}

/**
 * Get the current amount of xp assigned to a user
 * @param {Discord.GuildMember} target discord user object to select in database
 */
async function getXP(target) {
    if (!target || !(target instanceof Discord.GuildMember)) return false;
    let rows = await query(`SELECT * FROM dgmxp WHERE id = '${target.user.id}${target.guild.id}'`);
    return rows;
}

/**
 * Uses a message sent by author to update their xp in the database
 * @param {object} message message sent to be counted for author
 */
async function updateXP(message) {
    let maxs = await getGlobalSetting("max_xp");
    function genXP() {
        if (!maxs[0]) return 28;
        return Math.floor(Math.random() * (maxs[0].value - 15) + 15);
    }
    conn.query(`SELECT * FROM dgmxp WHERE id = '${message.author.id}${message.guild.id}'`, (err, rows) => {
        if (err) throw err;
        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO dgmxp (id, userid, guildid, xp, level) VALUES ('${message.author.id}${message.guild.id}', '${message.author.id}', '${message.guild.id}', ${genXP()}, 0)`;
        } else {
            // xp to next level = 5 * (lvl ^ 2) + 50 * lvl + 100 for mee6
            let xp = rows[0].xp + genXP();
            let levelNow = rows[0].level;
            let totalNeeded = 0;
            for (let x = 0; x < rows[0].level + 1; x++) {
                totalNeeded += (5 * (x ** 2)) + (50 * x) + 100;
            }
            if (xp > totalNeeded) levelNow++;
            /*let levelNow = Math.floor(0.1 * Math.sqrt(xp));
            if (rows[0].level !== levelNow) {
                rows[0].level = levelNow;
            }*/
            sql = `UPDATE dgmxp SET xp = ${xp}, level = ${levelNow} WHERE id = '${message.author.id}${message.guild.id}'`

            updateLevelRole(message.member, levelNow);
        }
        query(sql).catch((err) => {
            if (err.code === "ER_DUP_ENTRY") {
                return xlog.error('error: ER_DUP_ENTRY caught and deflected');
            } else {
                throw err;
            }
        });
    });
}

async function updateLevelRole(member, level) {
    if (!member || !member.guild || !member.guild.id || !level) return;
    let levelsEnabled = await getGuildSetting(member.guild, 'xp_levels');
    levelsEnabled = levelsEnabled[0] ? levelsEnabled[0].value : false;
    if (levelsEnabled === "enabled") {
        let levelRows = await checkForLevelRoles(member.guild);
        let availableRoles = [];
        for (let i = 0; i < levelRows.length; i++) {
            const r = levelRows[i];
            if (r.level <= level) {
                availableRoles.push(member.guild.roles.cache.find(ro => ro.id === r.roleid) || null);
            }
        }
        if (availableRoles && availableRoles.length > 0) {
            for (let i = 0; i < availableRoles.length; i++) {
                const r = availableRoles[i];
                if (r) {
                    if (r.comparePositionTo(member.guild.me.roles.highest) < 0) {
                        if (!member.roles.cache.find(ro => ro.id === r.id)) {
                            member.roles.add(r, 'levelling up').catch(console.error);
                        }
                    }
                }
                
            }
        }
        return;
    } else {
        return false;
    }
}

async function checkForLevelRoles(guild) {
    if (!guild) return;
    let levelRows = await query(`SELECT * FROM levelroles WHERE guildid = '${guild.id}' ORDER BY level DESC`);
    if (!levelRows || !levelRows.length) {
        for (const ro of levelRoles) {
            let roleToAdd = await guild.roles.create({
                data: {
                    name: ro.name || `Level ${ro.level}`,
                    color: ro.color || '#99AAB1',
                    permissions: 0,
                    position: 1
                }
            }).catch(console.error);
            await query(`INSERT INTO levelroles (id, guildid, roleid, level) VALUES ('${guild.id + roleToAdd.id}', '${guild.id}', '${roleToAdd.id}', ${ro.level})`);
        }
        levelRows = await query(`SELECT * FROM levelroles WHERE guildid = ${guild.id} ORDER BY level DESC`);
    } else {
        for (let i = 0; i < levelRows.length; i++) {
            const dbro = guild.roles.cache.find(ro => ro.id === levelRows[i].roleid);
            if (!dbro) {
                await query(`DELETE FROM levelroles WHERE roleid = '${levelRows[i].roleid}'`).catch(e => console.log(e.stack))
                levelRows.splice(i, 1);
            }
        }
    }
    return levelRows;
}

/**
 * add a new row of current statistics to gm counters
 * @param {object} client running discord client
 */
async function updateBotStats(client) {
    query(`INSERT INTO botstats (numUsers, numGuilds, numChannels) VALUES (${client.users.cache.size}, ${client.guilds.cache.size}, ${client.channels.cache.size})`).catch(xlog.error);
}

/**
 * get the current db stats for gm counters
 * @param {int} limiter number of past hours to retrieve
 */
async function getGMStats(limiter = 24) {
    let rows = await query(`SELECT * FROM botstats ORDER BY updateId DESC LIMIT ${limiter}`).catch(xlog.error);
    return rows;
}

/**
 * Update a setting for config in the global settings database
 * @param {string} selectortype column being used to select (name, category)
 * @param {string} selectorvalue value of column for selection
 * @param {string} value setting value
 * @param {object} updatedby user
 * @returns {object} result object with edit information, or string for promise rejection
 */
async function editGlobalSettings(selectortype = "", selectorvalue = "", updateuser, value = "") {
    return new Promise((resolve, reject) => {
        if (!selectortype || !selectorvalue || !value || !updateuser || !updateuser.id || typeof selectorvalue !== "string" || typeof value !== "string") return reject("MISSING_VALUES");
        if (selectortype !== "name" && selectortype !== "category") return reject("NAME_OR_CAT");
        conn.query(`UPDATE \`globalsettings\` SET \`previousvalue\`=\`value\`,\`value\`='${value}',\`updatedby\`='${updateuser.id}' WHERE \`${selectortype}\`='${selectorvalue}'`, (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) {
                return resolve(result);
            } else if (selectortype === "name") {
                conn.query(`INSERT INTO \`globalsettings\`(\`name\`, \`value\`, \`updatedby\`) VALUES ('${selectorvalue}','${value}','${updateuser.id}')`, (err, result) => {
                    if (err) throw err;
                    resolve(result);
                });
            } else {
                return reject("NONEXISTENT");
            }
        });
    });
}

async function getPrefix(guildid = "") {
    let rows = await query(`SELECT \`prefix\` FROM \`prefix\` WHERE \`guildid\` = '${guildid}'`).catch(xlog.error);
    if (rows.length > 0) {
        return rows[0].prefix;
    } else {
        return false;
    }
}

async function setPrefix(guildid = "", newprefix = "") {
    let rows = await query(`SELECT \`prefix\` FROM \`prefix\` WHERE \`guildid\` = '${guildid}'`).catch(xlog.error);
    if (rows.length > 0) {
        rows = await query(`UPDATE \`prefix\` SET \`prefix\`='${newprefix}' WHERE \`guildid\`='${guildid}'`).catch(xlog.error);
    } else {
        rows = await query(`INSERT INTO \`prefix\`(\`guildid\`, \`prefix\`) VALUES ('${guildid}', '${newprefix}')`).catch(xlog.error);
    }
}

/**
 * Gets the top 10 members by xp of a guild plus the ranking of the provided member.
 * @param {string} guildid id of guild to look up
 * @param {string} memberid id of member in guild to look up
 */
async function getTop10(guildid = "", memberid = "") {
    let rows = await query(`SELECT * FROM \`dgmxp\` WHERE \`guildid\` = '${guildid}' ORDER BY \`xp\` DESC LIMIT 10`);
    let personalrows = await query(`SELECT userid, xp, level , FIND_IN_SET( xp, ( SELECT GROUP_CONCAT( xp ORDER BY xp DESC ) FROM dgmxp WHERE guildid = '${guildid}' ) ) AS rank FROM dgmxp WHERE id = '${memberid}${guildid}'`);
    if (!rows.length) return false;
    return { rows: rows || [], personal: personalrows[0] || false };
}

/**
 * Gets the value of a discord guild setting, if it exists.
 * @param {object} guild guild object
 * @param {string} name property name
 */
async function getGuildSetting(guild, name) {
    if (!guild || !guild.available) return false;
    let rows = await query(`SELECT * FROM guildsettings WHERE guildid = '${guild.id}' AND property = '${name}'`).catch(xlog.error);
    if (rows.length > 0) {
        return rows;
    } else {
        return false;
    }
}

/**
 * Edits or deletes a setting for an individual Discord Guild.
 * @param {object} guild guild object to edit the settings for
 * @param {string} name property name of the setting
 * @param {string} value value to set for the property
 * @param {boolean} deleting whether to delete the setting
 */
async function editGuildSetting(guild, name = "", value = "", deleting = false) {
    return new Promise((resolve, reject) => {
        if (!guild || !guild.id || !name) return reject("MISSING_VALUES");
        if (deleting) {
            return conn.query(`DELETE FROM \`guildsettings\` WHERE guildid = '${guild.id}' AND property = '${name}'`, (err, result) => {
                if (err) throw err;
                if (result.affectedRows > 0) {
                    return resolve(result);
                } else {
                    reject('NO_DELETION');
                }
            });
        }
        if (!value) return reject("MISSING_VALUES");
        conn.query(`UPDATE \`guildsettings\` SET \`previousvalue\`=\`value\`,\`value\`='${value}' WHERE guildid = '${guild.id}' AND property = '${name}'`, (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) {
                return resolve(result);
            } else {
                conn.query(`INSERT INTO \`guildsettings\`(\`guildid\`, \`property\`, \`value\`) VALUES ('${guild.id}', '${name}', '${value}')`, (err, result) => {
                    if (err) throw err;
                    resolve(result);
                });
            }
        });
    });
}

/**
 * Deletes the xp entry for a member of a guild.
 * @param {object} member guild member to delete the xp for
 */
async function clearXP(member) {
    if (!member || !member.id || !member.guild || !member.guild.id) return false;
    let result = await query(`DELETE FROM dgmxp WHERE guildid = '${member.guild.id}' AND userid = '${member.id}'`).catch(xlog.error);
    return result.affectedRows || false;
}

/**
 * Deletes all xp entries for a guild.
 * @param {object} guild guild to delete the xp from
 */
async function massClearXP(guild) {
    if (!guild) return false;
    let result = await query(`DELETE FROM dgmxp WHERE guildid = '${guild.id}'`).catch(xlog.error);
    return result.affectedRows || false;
}

/**
 * Configure the role reward roles for a given guild.
 * @param {number} level the current level for the role to be set to
 * @param {Discord.Guild} guild the guild for the role to be set to
 * @param {Discord.Role} role the role to be added or configured
 * @param {boolean} deleting whether or not the given role should be deleted from the database, if true the level param will be ignored
 */
async function setLevelRole(level, guild, role, deleting = false) {
    if (!guild || !guild.id) return false;
    let result;
    if (role && deleting) {
        if (!role.id) return false;
        result = await query(`DELETE FROM levelroles WHERE guildid = '${guild.id}' AND roleid = '${role.id}'`);
        return result.affectedRows || false;
    }
    if (level && role) {
        if (isNaN(level) || !role.id) return false;
        result = await query(`UPDATE levelroles SET level = ${level} WHERE guildid = '${guild.id}' AND roleid = '${role.id}'`);
        if (!result) return false;
        if (result.affectedRows === 0) {
            //guild.roles.create()
            result = await query(`INSERT INTO levelroles (id, guildid, roleid, level) VALUES ('${guild.id + role.id}', '${guild.id}', '${role.id}', ${level})`)
        }
        return result.affectedRows;
    }
    if (role) {
        if (!role.id) return false;
        result = await query(`SELECT * FROM levelroles WHERE guildid = '${guild.id}' AND roleid = '${role.id}'`);
        if (!result.length) return false;
        return result;
    }
    result = await query(`SELECT * FROM levelroles WHERE guildid = '${guild.id}' ORDER BY level DESC`);
    if (!result[0]) return false;
    return result;
}

/**
 * Deletes all of the level roles for a given guild
 * @param {Discord.Guild} guild the guild to delete the roles of
 */
async function deleteAllLevelRoles(guild) {
    if (!(guild instanceof Discord.Guild)) return;
    let result = await query(`DELETE FROM levelroles WHERE guildid = '${guild.id}'`);
    if (result && result.affectedRows > 0) return result;
    return false;
}

/**
 * Log command usage (after execution)
 * @param {string} name name of command being logged
 */
async function logCmdUsage(name) {
    try {
        let oresult = await query(`SELECT * FROM cmdtracking WHERE cmdname = 'all'`);
        let result = await query(`SELECT * FROM cmdtracking WHERE cmdname = '${name}'`);
        if (!oresult || oresult.length === 0) {
            await query(`INSERT INTO cmdtracking (cmdname, used) VALUES ('all', 1)`);
        } else {
            await query(`UPDATE cmdtracking SET used = used + 1 WHERE cmdname = 'all'`);

        }
        if (!result || result.length === 0) {
            await query(`INSERT INTO cmdtracking (cmdname, used) VALUES ('${name}', 1)`);
        } else {
            await query(`UPDATE cmdtracking SET used = used + 1 WHERE cmdname = '${name}'`);
        }
    } catch (error) {
        xlog.error(error);
    }
}

/**
 * Get total number of commands sent from db
 * @returns {number} result object with edit information, or string for promise rejection
 */
async function getTotalCmdUsage() {
    try {
        return await query(`SELECT * FROM cmdtracking WHERE cmdname = 'all'`);
    } catch (error) {
        xlog.error(error);
    }
}

/**
 * Update a setting for config in the global settings database
 */
async function logMsgReceive() {
    try {
        let result = await query(`SELECT * FROM globalsettings WHERE name = 'mreceived'`);
        if (!result || result.length === 0) {
            await query(`INSERT INTO globalsettings (name, value) VALUES ('mreceived', '1')`);
        } else {
            await query(`UPDATE \`globalsettings\` SET \`previousvalue\`=\`value\`,\`value\`= value + 1 WHERE \`name\`='mreceived'`);
        }
    } catch (error) {
        xlog.error(error);
    }
}

/**
 * Update a setting for config in the global settings database
 */
async function logDefined() {
    xlog.log("DEFINED")
    try {
        let result = await query(`SELECT * FROM globalsettings WHERE name = 'definedcount'`);
        if (!result || result.length === 0) {
            await query(`INSERT INTO globalsettings (name, value) VALUES ('definedcount', '1')`);
        } else {
            await query(`UPDATE globalsettings SET previousvalue=value, value=value + 1 WHERE name='definedcount'`);
        }
    } catch (error) {
        xlog.error(error);
    }
}

/**
 * Set that spidey saved a member
 * @param {string} member object of the member who was saved
 */
async function setSpideySaved(target) {
    try {
        let result = await query(`SELECT * FROM dgmxp WHERE id = '${target.user.id}${target.guild.id}'`);
        if (!result || result.length === 0) {
            return false;
        } else {
            //const mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            await query(`UPDATE dgmxp SET spideySaved = CURRENT_TIMESTAMP WHERE id = '${target.user.id}${target.guild.id}'`);
            return true;
        }
    } catch (error) {
        xlog.error(error);
    }
}

/**
 * Create a subscription entry for Twitch webhooks in the database
 * @param {string} streamerid twitch id of streamer
 * @param {string} guildid id of guild for subscription
 * @param {*} expiredate a parseable date to be used to sort by timestamps for renewal
 * @param {string} message (optional) the message that will be sent with the discord notification
 */
async function addTwitchSubscription(streamerid, guildid, channelid, expiredate, message = "") {
    try {
        if (!streamerid || !guildid || !channelid || !expiredate) return false;
        let result = await query(`SELECT * FROM twitchhooks WHERE streamerid = '${streamerid}' AND guildid = '${guildid}'`);
        const expiresTimestamp = moment().add(expiredate).format('YYYY-MM-DD HH:mm:ss');
        if (!result || !result[0]) {
            if (!message || !message.length || typeof message !== "string") {
                await query(`INSERT INTO twitchhooks (id, streamerid, guildid, channelid, expires) VALUES ('${streamerid}${guildid}', '${streamerid}', '${guildid}', '${channelid}', '${expiresTimestamp}')`);
            } else {
                await query(`INSERT INTO twitchhooks (id, streamerid, guildid, channelid, message, expires) VALUES ('${streamerid}${guildid}', '${streamerid}', '${guildid}', '${channelid}', '${message}', '${expiresTimestamp}')`);
            }
            return true;
        } else {
            if (!message || !message.length || typeof message !== "string") {
                await query(`UPDATE twitchhooks SET expires = '${expiresTimestamp}' WHERE id = '${streamerid}${guildid}'`);
            } else {
                await query(`UPDATE twitchhooks SET expires = '${expiresTimestamp}', message = '${message}' WHERE id = '${streamerid}${guildid}'`);
            }
            return true;
        }
    } catch (error) {
        xlog.error(error);
        return false;
    }
}

/**
 * Create a subscription entry for Twitch webhooks in the database
 * @param {string} streamerid twitch id of streamer
 * @param {string} guildid id of guild for subscription
 * @param {*} expiredate a parseable date to be used to sort by timestamps for renewal
 * @param {string} message (optional) the message that will be sent with the discord notification
 */
async function removeTwitchSubscription(streamerid, guildid) {
    if (!streamerid || !guildid) return false;
    let delresult = await query(`DELETE FROM twitchhooks WHERE streamerid = '${streamerid}' AND guildid = '${guildid}'`);
    return delresult.affectedRows;
}

/**
 * get a list of database entries that use a specified streamer id
 * @param {string} streamerid twitch id of streamer
 */
async function getTwitchSubsForID(streamerid) {
    try {
        if (!streamerid) return false;
        let result = await query(`SELECT * FROM twitchhooks WHERE streamerid = '${streamerid}'`);
        if (!result.length) return false;
        return result;
    } catch (error) {
        xlog.error(error);
    }
}

exports.conn = conn;
exports.getXP = getXP;
exports.updateXP =  updateXP;
exports.updateBotStats = updateBotStats;
exports.getGMStats = getGMStats;
exports.getGlobalSetting = getGlobalSetting;
exports.editGlobalSettings = editGlobalSettings;
exports.getPrefix = getPrefix;
exports.setPrefix = setPrefix;
exports.getTop10 = getTop10;
exports.getGuildSetting = getGuildSetting;
exports.editGuildSetting = editGuildSetting;
exports.clearXP = clearXP;
exports.massClearXP = massClearXP;
exports.levelRoles = levelRoles;
exports.updateLevelRole = updateLevelRole;
exports.checkForLevelRoles = checkForLevelRoles;
exports.setLevelRole = setLevelRole;
exports.deleteAllLevelRoles = deleteAllLevelRoles;
exports.logCmdUsage = logCmdUsage;
exports.getTotalCmdUsage = getTotalCmdUsage;
exports.logMsgReceive = logMsgReceive;
exports.logDefined = logDefined;
exports.setSpideySaved = setSpideySaved;
exports.addTwitchSubscription = addTwitchSubscription;
exports.getTwitchSubsForID = getTwitchSubsForID;
exports.removeTwitchSubscription = removeTwitchSubscription;
