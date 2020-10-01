const { Structures } = require('discord.js');

module.exports = Structures.extend(
    'Guild',
    Guild =>
        class VoiceGuild extends Guild {
            get defaultChannel() {
                if (this.channels.cache.has(this.id)) return this.channels.get(this.id); // get the legacy default channel if exists

                const general = this.channels.cache.find(
                    c => c.name === 'general' && c.type === 'text' && c.permissionsFor(this.me).has('SEND_MESSAGES')
                );
                if (general) return general;

                return this.channels.cache
                    .find(c => c.type === 'text' && c.permissionsFor(this.me).has('SEND_MESSAGES'))
                    .sort((a, b) => a.position - b.position)
                    .first();
            }
        }
);
