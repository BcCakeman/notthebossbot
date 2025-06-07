const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-ticket-entry')
		.setDescription('Sends a message with a "Create Ticket" button, turning this channel into a ticket'),
	async execute(client, interaction) {

		var row = new ActionRowBuilder();

		const newTicket = new ButtonBuilder()
			.setCustomId("new-ticket")
			.setLabel("New Ticket")
			.setStyle(ButtonStyle.Primary);

		row.addComponents(newTicket);

		//GENERATE OUR EMBED
		const titleText = 'Tickets Message';
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(titleText)
			.setAuthor({ name: interaction.user.username, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.webp` })
			.setDescription('Craete a ticket to get assigned roles.');


		interaction.reply({
			embeds: [embed],
			components: [row],
		});
	}
};