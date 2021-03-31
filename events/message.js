module.exports = (client, message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    const prefix = client.db.selectGuildPrefix.pluck().get(message.guild.id) || client.config.commandPrefix;

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, match] = message.content.match(prefixRegex);
    const args = message.content.slice(match.length).trim().split(/\s+/g);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.aliases.get(cmd);
    if (!command) return;

    if (!message.member.hasPermission(command.usage.userPermissions)) return;
    if (!message.guild.me.hasPermission(command.usage.clientPermissions)) return;

    command.run(client, message, args);
};
