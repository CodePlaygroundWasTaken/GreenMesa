/**
 * Returns similarity value based on Levenshtein distance.
 * The value is between 0 and 1
 *
 * @param {string} s1 first string
 * @param {string} s2 second string
 * @returns
 */
function stringSimilarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
}

/**
 * helper function for stringSimilarity
 *
 * @param {*} s1
 * @param {*} s2
 * @returns
 */
function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Executes a RegExp on a string and returns last result of first search if successful
 *
 * @param {string} str String to search in
 * @param {RegExp} regex RegExp to search with
 * @returns
 */
function extractString(str, regex) {
    let result = regex.exec(str);
    if (!result)
        return undefined;
    return result[result.length - 1];
}

/**
 * Extracts the id from a string and the fetches the User
 *
 * @export
 * @param {object} client the client
 * @param {string} text Text to extract id from
 * @returns User
 */
async function stringToUser(client, text) {
    text = extractString(text, /<@!?(\d*)>/) || text;
    return await client.fetchUser(text) || undefined;
}

/**
 * Parses a string into a Role object or a String for 'everyone' or 'here'.
 * If the role name isn't accurate the function will use the stringSimilarity method.
 * Can parse following input:
 * - here / everyone name
 * - @here / @everyone mention
 * - role name
 * - role mention
 * - role id
 * - similar role name
 *
 * @export
 * @param {Guild} guild guild where the role is in
 * @param {string} text string to parse
 * @param {boolean} [byName=true] if it should also search by name (default true)
 * @param {boolean} [bySimilar=true] if it should also search by similar name (default true)
 * @returns
 */
function stringToRole(guild, text, byName = true, bySimilar = true) {

    if (text == 'here' || text == '@here') {
        return '@here';
    }
    if (text == 'everyone' || text == '@everyone') {
        return '@everyone';
    }

    text = extractString(text, /<@&(\d*)>/) || text;

    // by id
    var role = guild.roles.cache.get(text);
    if (!role && byName) {
        // by name
        role = guild.roles.cache.find(x => x.name == text);
    }
    if (!role && bySimilar) {
        // closest matching name
        role = guild.roles.cache.reduce(function (prev, curr) {
            return (stringSimilarity(curr.name, text) > stringSimilarity(prev.name, text) ? curr : prev);
        });
        if (stringSimilarity(role.name, text) < 0.4) {
            role = undefined;
        }
    }
    return role;
}

/**
 * Parses a string into a Channel object.
 * Can parse following input:
 * - channel mention
 * - channel id
 * - channel name
 * - similar channel name
 *
 * @export
 * @param {Guild} guild guild where channel is in
 * @param {string} text string to parse
 * @returns
 */
function stringToChannel(guild, text, byName = true, bySimilar = true) {
    if (!guild || !text) return null;
    text = extractString(text, /<#(\d*)>/) || text;

    let channel = guild.channels.cache.get(text);
    if (!channel && byName) channel = guild.channels.cache.find(x => x.name == text);
    if (!channel && bySimilar) {
        // closest matching name
        channel = guild.channels.cache.reduce(function (prev, curr) {
            return (stringSimilarity(curr.name, text) > stringSimilarity(prev.name, text) ? curr : prev);
        });
        if (stringSimilarity(channel.name, text) < 0.4) {
            channel = undefined;
        }
    }
    return channel;
}

/**
 * Parses a string into a JSON object for Embed.
 *
 * @export
 * @param {string} text string to parse
 * @returns
 */
function stringToEmbed(text) {
    var embed = null;
    try {
        //text = text.replace(/(\r\n|\n|\r|\t| {2,})/gm, '');
        embed = JSON.parse(text);
    } catch (e) {
        return null;
    }
    return embed
}

exports.stringToUser = stringToUser;
exports.stringToRole = stringToRole;
exports.stringToChannel = stringToChannel;
exports.stringToEmbed = stringToEmbed;