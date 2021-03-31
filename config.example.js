module.exports = {
    token: 'your_token_here',

    /**
     * Should managed channels be removed if they only contain bots?
     * Default: true
     */
    ignoreBots: true,

    commandPrefix: '.',

    categoryName: 'VoiceBoy',

    channelName: 'Join To Create',

    channelNameSimilar: count => `Join To Create ${count}`,

    invite: 'invite_link',

    presence: '.help | .invite',

    motd: {
        "embed": {
            "title": "VoiceBoy",
            "description": "Hello world!",
            "url": "https://github.com/calumari/VoiceBoy"
        }
    },

    helpCommand: {
        embed: {
            title: '**VoiceBoy**',
            url: 'https://github.com/calumari/VoiceBoy',
            footer: {
                text: 'Created by calumari#0001 • v2.0.0',
            },
            fields: [
                {
                    name: 'General',
                    value:
                        '`.invite`\nInvite VoiceBoy to your server!\n\n`.help`\nSee this message. (hey)\n\n`.claim`\nClaim your current voice channel if the owner is no longer present.',
                },
                {
                    name: 'Admin',
                    value:
                        "`.setup`\nCreates a VoiceBoy trigger channel. This can be run multiple times!\n\n`.prefix <prefix>`\nSets VoiceBoy's command prefix. Default prefix: '.'\n\n`.cleanup`\nCleans up unused/empty channels left by VoiceBoy.",
                },
            ],
        },
    },
};
