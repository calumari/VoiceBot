const { Permissions } = require('discord.js');

exports.run = async (client, message, args) => {
    try {
        let parent = message.guild.channels.cache.find(
            c => c.name === client.config.categoryName && c.type === 'category'
        );
        if (!parent) {
            parent = await message.guild.channels.create(client.config.categoryName, {
                type: 'category',
            });
        }

        const count = parent.children.filter(c => c.name.startsWith(client.config.channelName)).size;
        const name = count > 0 ? client.config.channelNameSimilar(count) : client.config.channelName;

        const channel = await message.guild.channels.create(name, {
            type: 'voice',
            parent: parent.id,
        });
        message.guild.addTriggerChannel(channel);

        message.channel.send({
            embed: {
                title: 'VoiceBoy is now setup!',
                description: `I've created a new voice channel called **${name}**. Feel free to edit, move or rename it however you please.`,
            },
        });
    } catch (err) {
        console.error(err); // todo: send permission message!
    }
};

exports.usage = {
    name: 'setup',
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR],
    clientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],
};
