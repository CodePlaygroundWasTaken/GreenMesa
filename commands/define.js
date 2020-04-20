const fs = require("fs");
const fetch = require("node-fetch")

module.exports = {
    name: 'define',
    description: 'Use this sleek command that I spent hours creating to get the beautiful definition of any proper English word!',
    args: true,
    usage: "<some english word>",
    aliases: ['def'],
    execute(client, message, args) {
        if (args.length == 1) {
            if (message.channel.type === "text" && message.mentions.members.size) {
                if (message.mentions.members.first().id == "142831008901890048") {
                    return message.channel.send({
                        embed: {
                            "title": "The definition of " + message.mentions.users.first().username,
                            "description": "One of the universe's worst ideas",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                            }
                        }
                    });
                }
                if (message.mentions.members.first().id == "343386990030356480") {
                    return message.channel.send({
                        embed: {
                            "title": "The definition of " + message.mentions.users.first().username,
                            "description": "a total dumbass",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                            }
                        }
                    });
                }
                if (message.mentions.members.first().id == "211992874580049920") {
                    return message.channel.send({
                        embed: {
                            "title": "The definition of " + message.mentions.users.first().username,
                            "description": "Idiot",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                            }
                        }
                    });
                }
                return message.channel.send({
                    embed: {
                            "title": "Well you see I can't define that mention",
                            "description": "I can't define mentions unless they are special!",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                        }
                    }
                });
            }
            let def = args[0].toLowerCase();
            let letters = /^[A-Za-z]+$/; // regular expression testing whether everything matched against contains only upper/lower case letters
            if (letters.test(def)) {
                fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${def}?key=03464f03-851d-4df0-ad53-4afdb47311d8`)
                    .then(res => res.json())
                    .then(j => {
                        if(!j[0]) {
                            message.channel.send({
                                embed: {
                                    "title": "It appears you typed gibberish.",
                                    "description": "That or there was an unhandled error.",
                                    "color": 16750899,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "text": "Definitions"
                                    }
                                }
                            }).catch(console.error);
                        } else if (!j[0].shortdef) {
                            j.push("or " + j.pop() + "?");
                            var altWords = j.join(", ");
                            const embed = {
                                "title": "Your word could not be found",
                                "description": "Did you mean: " + altWords,
                                "color": 16750899,
                                "timestamp": new Date(),
                                "footer": {
                                    "text": "Definitions"
                                }
                            };
                            message.channel.send({ embed }).catch(console.error);
                        } else {
                            const largeDefs = [];
                            for (let i = 0; i < j.length; i++) {                                
                                let r = j[i];

                                if (r.hwi.hw && r.shortdef.length >= 1) {
                                    let defsArray = [];
                                    for (var x = 0; x < r.shortdef.length; x++) {
                                        defsArray[x] = "[" + (x + 1) + "] " + r.shortdef[x];
                                    }

                                    /*https://nodejs.org/en/knowledge/getting-started/what-is-require/
                                    * The rules of where require finds the files can be a little
                                    * complex, but a simple rule of thumb is that if the file
                                    * doesn't start with "./" or "/", then it is either considered
                                    * a core module (and the local Node path is checked), or a
                                    * dependency in the local node_modules folder. If the file
                                    * starts with "./" it is considered a relative file to the
                                    * file that called require. If the file starts with "/", it
                                    * is considered an absolute path. NOTE: you can omit ".js"
                                    * and require will automatically append it if needed. For
                                    * more detailed information, see the official docs
                                    */
                                    /*https://nodejs.org/api/modules.html#modules_file_modules
                                    * If the exact filename is not found, then Node.js will attempt to
                                    * load the required filename with the added extensions: .js, .json, and finally.node.
                                    *
                                    * .js files are interpreted as JavaScript text files, and.json files are
                                    * parsed as JSON text files..node files are interpreted as compiled addon modules loaded with process.dlopen().
                                    *
                                    * A required module prefixed with '/' is an absolute path to the file.For example,
                                    * require('/home/marco/foo.js') will load the file at / home / marco / foo.js.
                                    *
                                    * A required module prefixed with './' is relative to the file calling require().That is,
                                    * circle.js must be in the same directory as foo.js for require('./circle') to find it.
                                    *
                                    * Without a leading '/', './', or '../' to indicate a file, the module must either be
                                    * a core module or is loaded from a node_modules folder.
                                    *
                                    * If the given path does not exist, require() will throw an Error with its
                                    * code property set to 'MODULE_NOT_FOUND'.
                                    */
                                    const config = require("../auth.json");
                                    if (config.wordsDefinedCount) config.wordsDefinedCount += 1;
                                    if (!config.wordsDefinedCount) config.wordsDefinedCount = 1;
                                    if (config.wordsDefined && !config.wordsDefined.includes(def)) config.wordsDefined.push(def);
                                    if (!config.wordsDefined) config.wordsDefined = [def];
                                    fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
                                        if (err) return console.log(err);
                                    });
                                    largeDefs.push({
                                        name: r.hwi.hw.split('*').join(" ● "),
                                        value: defsArray.join(", ")
                                    });
                                }
                            }
                            message.channel.send({
                                embed: {
                                    "title": "The definition of " + def,
                                    "color": 65280,
                                    "timestamp": new Date(),
                                    "fields": largeDefs,
                                    "footer": {
                                        "text": "Definitions | Collegiate Dictionary"
                                    }
                                }
                            }).catch(console.error);
                        }
                }).catch(console.error);

            } else {
                message.channel.send({
                    embed: {
                        "title": "Please send a valid word to be defined",
                        "description": "Whatever you entered wasn't found to be valid, it probably contained a number",
                        "color": 16711680,
                        "timestamp": new Date(),
                        "footer": {
                            "text": "Definitions"
                        }
                    }
                }).catch(console.error);
            }
        } else {
            message.channel.send({
                embed: {
                    "title": "Please send only one term/argument to define",
                    "description": "$<def>/<define> <proper non-medical English word>",
                    "color": 16711680,
                    "timestamp": new Date(),
                    "footer": {
                        "text": "Definitions"
                    }
                }
            }).catch(console.error);
        }
    }
}