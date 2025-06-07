const { Events, ChannelType, ThreadAutoArchiveDuration, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {

        //IF we have a button do this
        if (interaction.isButton()) {
            console.log("Button event. ID:" + interaction.customId);

            if (interaction.customId === "new-ticket") {

                const thread = await interaction.channel.threads.create({
                    name: `${interaction.user.username}'s ticket`,
                    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                    type: ChannelType.PrivateThread,
                    reason: 'Ticket for getting roles',
                });

                thread.members.add(interaction.member);

                var row = new ActionRowBuilder();

                const closeTicketButton = new ButtonBuilder()
                    .setCustomId("close-ticket")
                    .setLabel("Close Ticket")
                    .setStyle(ButtonStyle.Danger);

                row.addComponents(closeTicketButton);

                //GENERATE OUR EMBED
                const titleText = `${interaction.user.username}'s ticket`;
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(titleText)
                    .setImage('https://cdn.discordapp.com/emojis/1088649138805162044.webp?size=96')
                    .setDescription('Created a ticket to get assigned roles.');


                thread.send ({
                    embeds: [embed],
                    components: [row],
                });

                interaction.reply({ content: `Created a ticket: ${thread}`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === "close-ticket") { 

                await interaction.reply("Ticket Closed (thread archived)");
                await interaction.channel.setLocked(true);
                await interaction.channel.setArchived(true);
            }

        }
    },
};