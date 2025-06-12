const { Events, EmbedBuilder } = require('discord.js');
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("fs");
const { text } = require('stream/consumers');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		setInterval(checkYtUpdates, 60 * 1000)
		
		async function checkYtUpdates() {
		
			console.log("Checking for YT Updates");
		
			const youtubeData = JSON.parse(fs.readFileSync(`${__dirname}/../json/youtube-data.json`));
				let newYoutubeData = youtubeData;
		
				for (let i = 0; i < youtubeData.trackedChannels.length; i++) {
					const trackedChannel = youtubeData.trackedChannels[i];
		
					console.log(trackedChannel);
					console.log("doing channel: " + trackedChannel.id);
		
					const queriedData = await parser.parseURL(
						`https://youtube.com/feeds/videos.xml?channel_id=${trackedChannel.id}`
					).catch(console.error);
		
					if (queriedData.items[0] == null) {
						console.error("YT channel has no videos");
						continue;
					}
					const newestVideoActual = queriedData.items[0].id;
					console.log(`newest vid actual: ${newestVideoActual}`);
		
					if (newestVideoActual !== trackedChannel.lastVidId) {
		
						newYoutubeData.trackedChannels[i].lastVidId = newestVideoActual;
		
						console.log("new video... set tracked channel to " + newestVideoActual);
		
						for (notificationLocation of trackedChannel.notificationLocations) {
							console.log("Because there is a new video, we are notifying: " + notificationLocation.guildId)
		
							const guild = await client.guilds.fetch(notificationLocation.guildId);
							const channel = await guild.channels.fetch(notificationLocation.channelId);
		
							const { title, link, id, author } = queriedData.items[0];
							const embed = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle(title)
								.setURL(link)
								.setImage(`https://img.youtube.com/vi/${newestVideoActual.slice(9)}/maxresdefault.jpg`)
								.setDescription('Wow. What a cool technology.');
		
							await channel.send({ embeds: [embed] })
						}
		
					}
				}
		
				fs.writeFileSync((`${__dirname}/../json/youtube-data.json`), JSON.stringify(newYoutubeData));
		
		}
	},
};
