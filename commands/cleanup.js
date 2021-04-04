const { Permissions, Constants } = require('discord.js');

exports.run = (client, message, args) => {
    const parent = message.guild.channels.cache.find(
        c => c.name === client.config.categoryName && c.type === Constants.ChannelTypes.CATEGORY
    );
    if (!parent) return;
    for (const [, channel] of parent.children) {
        channel.delete('cleaned up');
    }
};

exports.usage = {
    name: 'cleanup',
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR],
};
