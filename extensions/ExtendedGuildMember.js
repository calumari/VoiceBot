const { Structures } = require('discord.js');

module.exports = Structures.extend('GuildMember', GuildMember => {
    class ExtendedGuildMember extends GuildMember {
        hasVoiceRole() {
            return this.guild.hasVoiceRole() && this.roles.cache.some(r => r.id === this.guild.voiceRoleId);
        }
    }

    return ExtendedGuildMember;
});
