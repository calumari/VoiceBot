const parentName = 'VoiceBoy'; // todo config

exports.run = async (client, message, args) => {
    try {
        let parent = message.guild.channels.cache.find(c => c.name === parentName && c.type === 'category');
        if (!parent) {
            parent = await message.guild.channels.create(parentName, { type: 'category' });
        }

        const channel = await message.guild.channels.create('Join to Create', { type: 'voice', parent: parent.id });
        message.guild.addTriggerChannel(channel);
    } catch (err) {
        console.error(err); // todo: send permission message!
    }
};

exports.usage = {
    name: 'setup',
    userPermissions: ['ADMINISTRATOR'],
    clientPermissions: ['MANAGE_CHANNELS'],
};
