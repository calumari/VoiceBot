module.exports = {
    token: 'your_token_here',

    botOwners: [],

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

    motd: null,

    helpCommand: pjson => ({
        embed: {
            title: '**VoiceBoy**',
            url: `${pjson.homepage}`,
            footer: {
                text: `Created by calumari#0001 • v${pjson.version}`,
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
                        "`.setup`\nCreates a VoiceBoy trigger channel. This can be run multiple times!\n\n`.prefix <prefix>`\nSets VoiceBoy's command prefix. Default prefix: '.'\n\n`.cleanup`\nCleans up unused/empty channels left by VoiceBoy.\n\n`.voicerole <role name or id>`\nGive users a role while in a voice channel.",
                },
            ],
        },
    }),

    voiceRole: {
        cronTime: '* */1 * * *',

        softThreshold: 600000,

        hardThreshold: 21600000,
    },

    cooldowns: {
        create: 5000,
    },
};
