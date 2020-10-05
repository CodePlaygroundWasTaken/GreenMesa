//const { prefix } = require('../auth.json');
//const { getGlobalSetting } = require('../dbmanager');
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: 'commands',
    description: 'get a command list or command help',
    cooldown: 5,
    async execute(client, message) {
        try {
            const { commands } = message.client;
            const { categories } = message.client;
            const cats = categories.map(c => c.name);
            const catnames = {
                "moderation": "management"
            };
            categories.each((c) => {
                if (Object.keys(catnames).includes(c)) {
                    categories.get(c).name = catnames[c];
                }
            });
            
            for (let c = 0; c < cats.length; c++) {
                const cat = cats[c];
                const data = [];
                //data.push(`**My public commands: (${commands.array().length})**`);
                // for some reason if you don't separate \` ${command.name} \` with a space it flips out
                //                                         ^               ^
                data.push(commands.filter(comd => !['botkill', 'botreset', 'creload', 'evaluate'].includes(comd.name) && ((comd.category && comd.category === cat) || (cat === 'misc' && !comd.category))).map(command => {
                    let availableDesc = command.description || "*no description*";
                    if (command.description && (command.description.short || command.description.long)) {
                        availableDesc = command.description.short || command.description.long;
                    }
                    return `\` ${command.name} \` - ${availableDesc}`
                }).join('\n'));
                data.push(`**You can send \`${message.gprefix}help [command name]\` to get help on a specific command!**`)
                let cmdcount = commands.filter(comd => !['botkill', 'botreset', 'creload', 'evaluate'].includes(comd.name) && ((comd.category && comd.category === cat) || (cat === 'misc' && !comd.category))).size;
                await message.author.send({
                    embed: {
                        title: `${categories.get(cat).emoji + ' ' || ''}${categories.get(cat).name}`,
                        color: parseInt((await getGlobalSetting("darkred_embed_color") || ['7322774'])[0].value, 10),
                        description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                        footer: {
                            text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s)`
                        }
                    }
                }).catch(console.error);
            }

            
            if (message.channel.type === 'dm') return;
            message.channel.send(":e_mail: *you've* got mail!");
        } catch (error) {
            console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            message.channel.send('I can\'t DM you! Do you have DMs disabled?');
        }
        return;
    }
}