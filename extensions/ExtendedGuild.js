const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
    class ExtendedGuild extends Guild {
        constructor(...args) {
            super(...args);
            this.managed = this.client.db.selectGuildChannelsByGuild.all(this.id).reduce((obj, item) => Object.assign(obj, { [item.id]: item['user_id'] }), {});
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

        removeTriggerChannel(channelResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            this.client.db.deleteGuildTrigger.run(id);
            this.triggers.splice(this.triggers.indexOf(id), 1);
        }

        addManagedChannel(channelResolvable, userResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            const userId = this.client.users.resolveID(userResolvable);
            this.client.db.insertGuildChannel.run(id, userId, this.id);
            this.managed[id] = userId;
        }

        removeManagedChannel(channelResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            this.client.db.deleteGuildChannel.run(id);
            delete this.managed[id];
        }

        transferManagedChannel(channelResolvable, userResolvable) {
            const id = this.channels.resolveID(channelResolvable);
            const userId = this.client.users.resolveID(userResolvable);
            this.client.db.transferGuildChannel.run(userId, id, this.id);
            this.managed[id] = userId;
        }

        isManagedChannel(channelResolvable) {
            return this.channels.resolveID(channelResolvable) in this.managed;
        }

        getManagedChannelOwnerId(channelResolvable) {
            return this.managed[this.channels.resolveID(channelResolvable)];
        }

        isTriggerChannel(channelResolvable) {
            return this.triggers.includes(this.channels.resolveID(channelResolvable));
        }
    }

    return ExtendedGuild;
});
