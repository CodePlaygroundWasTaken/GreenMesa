import config from '../../../auth.json';
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1';
import {
    IamAuthenticator
} from 'ibm-watson/auth';
import xlg from '../../xlogger';
import {
    Command
} from 'src/gm';

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    authenticator: new IamAuthenticator({
        apikey: config.NLPAPIKEY,
    }),
    url: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/c3583068-a860-4dea-b3b3-d417250e51bc',
});

//For the future: There's more coming. In the future I may move to another Language Processor, or offer more to choose from by user preference. AYLIEN, Google Cloud, Twinword.

export const command: Command = {
    name: 'sentiment',
    description: {
        short: 'get the sentiment of provided text or a message',
        long: 'Get the analyzed sentiment of a message using machine learning. More features may come (besides sentiment analysis), and allowing URLs to be entered for HTML processing'
    },
    aliases: ['sm', 'emotion', 'saltiness'],
    usage: "<message id to process / text content to process>",
    args: true,
    cooldown: 4,
    ownerOnly: false,
    async execute(client, message, args) {
        try {
            let msgContent: string;
            if (args.length == 1 && !isNaN(parseInt(args.toString(), 10)) && args.toString().length == 18) {
                const msg = await message.channel.messages.fetch(args[0]);
                msgContent = msg.content;
            } else {
                msgContent = args.join(" ");
            }

            const analyzeParams = {
                'text': `${msgContent}`,
                'language': 'en',
                'features': {
                    'sentiment': {},
                    'emotion': {}
                }
            }

            const wMsg = await message.channel.send('Analyzing...');

            naturalLanguageUnderstanding.analyze(analyzeParams)
                .then(analysisResults => {
                    const emotionsResults = analysisResults.result.emotion?.document?.emotion;
                    if (!emotionsResults) {
                        wMsg.edit("No analysis result.");
                        return;
                    }
                    const emotions = [];
                    for (const emotionKey in emotionsResults) {
                        emotions.push(`**${emotionKey[0].toUpperCase() + emotionKey.slice(1)}:** ${(emotionsResults[<keyof typeof emotionsResults>emotionKey] || 0) * 100}%`)
                    }

                    wMsg.edit({
                        content: "",
                        embed: {
                            "description": "Use an AI to tell you all about your text.",
                            "color": 9860623,
                            "fields": [{
                                    "name": "Sentiment Analysis",
                                    "value": "Sentiment is the overall emotion/tone of a message."
                                },
                                {
                                    "name": "Sentiment",
                                    "value": analysisResults.result.sentiment?.document?.label,
                                    "inline": true
                                },
                                {
                                    "name": "Score",
                                    "value": ((analysisResults.result.sentiment?.document?.score || 0) * 100).toString() + "%",
                                    "inline": true
                                },
                                {
                                    "name": "Emotion Analysis",
                                    "value": 'Detected emotion probability.\n' + emotions.join('\n')
                                }
                            ],
                            "footer": {
                                "text": "Watson Natural Language Processing"
                            }
                        }
                    }).catch(console.error);
                })
                .catch(err => {
                    wMsg.edit('**FAILED** *please note* that you cannot send an id of an embed, they are not compatible.');
                    console.log('Sentiment File Error:', err);
                });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

