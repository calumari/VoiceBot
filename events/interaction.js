module.exports = {
    once: true,
    run: interaction => {
        if (!interaction.isCommand()) return
        console.log(interaction)
        // const [, match] = message.content.match(prefixRegex);
        // const args = message.content.slice(match.length).trim().split(/\s+/g);
        // const label = interaction.commandName.toLowerCase();

        // const command = client.commands.get(label) || client.aliases.get(label);
        // if (!command) return;

        // if (!message.member.hasPermission(command.usage.userPermissions)) return;
        // if (!message.guild.me.hasPermission(command.usage.clientPermissions)) {
        //     return message.reply(
        //         `I don't have permission to do that. I need **${command.usage.clientPermissions.join(', ')}**!`
        //     );
        // }

        // command.run(client, message, label, args);
    }
}