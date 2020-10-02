const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
    class VoiceGuild extends Guild {
        constructor(...args) {
            super(...args);
            this.managed = this.client.db.selectGuildChannelsByGuild.all(this.id).map(result => result.id);
            this.triggers = this.client.db.selectGuildTriggersByGuild.all(this.id).map(result => result.id);
        }

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

        sendAlert(message) {
            const channel = this.defaultChannel;
            if (channel) {
                channel.send(message);
            }
        }

        addTriggerChannel(channelResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            this.client.db.insertGuildTrigger.run(id, this.id);
            this.triggers.push(id);
        }

        addManagedChannel(channelResolvable, userResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            this.client.db.insertGuildChannel.run(id, this.client.users.resolveID(userResolvable), this.id);
            this.managed.push(id);
        }

        removeManagedChannel(channelResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            this.client.db.deleteGuildChannel.run(id);
            this.managed.splice(this.managed.indexOf(id), 1);
        }
    }

    return VoiceGuild;
});
