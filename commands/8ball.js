// 8ball response generator
function doMagic8BallVoodoo() {
    var rand = ['Yes', 'No', 'Why try?', 'Maybe', 'Never'];
    return rand[Math.floor(Math.random() * rand.length)];
}

module.exports = {
    name: '8ball',
    description: 'play some *magic* 8ball (not pool)',
    execute(client, message, args, conn) {
        message.channel.send(doMagic8BallVoodoo()).catch(console.error);
    }
}