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
		const titleText = 'Request Log Review';
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(" ")
			.setImage('https://cdn.discordapp.com/emojis/1088649138805162044.webp?size=96')
			.setDescription('# Create a ticket to get assigned roles.');


		interaction.reply({
			embeds: [embed],
			components: [row],
		});
	}
};