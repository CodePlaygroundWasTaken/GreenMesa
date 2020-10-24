const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const emojiConversion = {
    "A": "🇦",
    "B": "🇧",
    "C": "🇨",
    "D": "🇩",
    "E": "🇪",
    "F": "🇫",
    "G": "🇬",
    "H": "🇭",
    "I": "🇮",
    "J": "🇯",
    "K": "🇰",
    "L": "🇱",
    "M": "🇲",
    "N": "🇳",
    "O": "🇴",
    "P": "🇵",
    "Q": "🇶",
    "R": "🇷",
    "S": "🇸",
    "T": "🇹",
    "U": "🇺",
    "V": "🇻",
    "W": "🇼",
    "X": "🇽",
    "Y": "🇾",
    "Z": "🇿",
}

module.exports = {
    name: "emojify",
    description: "convert text to emojies",
    usage: "<text>",
    args: true,
    async execute(client, message, args) {
        let textArray = args.join(" ").split("");
        let mappedText = [];
        for (let i = 0; i < textArray.length; i++) {
            const letter = textArray[i].toUpperCase();
            if (emojiConversion[letter]) {
                mappedText.push(`${emojiConversion[letter]}\u200b`);
            } else {
                mappedText.push(letter);
            }
        }
        if (mappedText.length < 1) {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10),
                    description: "no emojified content"
                }
            }).catch(xlg.error);
            return false;
        }
        message.channel.send(mappedText.join("")).catch(xlg.error);
        return true;
    }
}