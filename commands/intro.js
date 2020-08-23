const config = require('../auth.json');

module.exports = {
    name: 'intro',
    description: 'provides a *crappy* introduction to the bot',
    execute(client, message) {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "Introduction",
                description: "This multifunctioning disfunctioning Discord bot was built by ComradeRooskie#6969, who runs [EnigmaDigm](https://enigmadigm.com). This bot can do a bunch of random stuff right now, and bigger and better features are in development ;).",
                fields: [
                    {
                        name: "Do you have any commands?",
                        value: `*Yes in fact.* I didn't use months of my life for nothing. Use the \` ${config.prefix}help \` command to get info on them, or see the GitHub repo.`
                    },
                    {
                        name: "How do I contribute?",
                        value: "If you want to make a request you can open up an issue [here](https://github.com/enigmadigm/greenmesa/issues) (an issue doesn't have to be a bug, it's an opportunity to make your voice heard)."
                    },
                    {
                        name: "What am I supposed to do?",
                        value: `||\` don't  get  caught  doing  anything  stupid \`|| (\`${config.prefix}help\` will tell you everything you can do)`
                    },
                    {
                    name: "How do I find out more?",
                    value: "Use commands like `help` and `info` to get more information. Visit [the GreenMesa GitHub repo](https://github.com/enigmadigm/GreenMesa), or my [website under development](https://enigmadigm.com/apps/greenmesa/)."
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: `The Intro | See ${config.prefix}info for app info`
                }
            }
        });

    }
}