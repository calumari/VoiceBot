const { Structures } = require('discord.js');

module.exports = Structures.extend('VoiceChannel', VoiceChannel => {
    class ExtendedVoiceChannel extends VoiceChannel {
        isEmpty(ignoreBots = true) {
            return ignoreBots ? this.members.every(member => member.user.bot) : this.members.size === 0;
        }
    }

    return ExtendedVoiceChannel;
});
