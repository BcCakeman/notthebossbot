const { Events, EmbedBuilder } = require('discord.js');
const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser({
	customFields: {
		item: [
			['media:group', 'media:group']
		]
	}
});

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

			// Loop through every channel in the config file. Everything happens in this loop
			for (let i = 0; i < youtubeData.trackedChannels.length; i++) {

				const trackedChannel = youtubeData.trackedChannels[i];
				// Get data from YT
				const queriedData = await parser.parseURL(
					`https://youtube.com/feeds/videos.xml?channel_id=${trackedChannel.id}`
				).catch(console.error);

				// Loop through the YT data to fing the most recent video
				let YtNewestVid = {};
				for (item of queriedData.items) {
					console.log(`checking item ${item.id}, description: ${item["media:group"]?.["media:description"]}`);

					// Generate regex to check for tags like #live #eso #etc

					//this accounts for escape characters like "."
					function escapeRegex(str) {
						return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					}

					function buildTagRegex(tags) {
						const pattern = tags.map(escapeRegex).join('|');
						return new RegExp(`(^|\\s)#(${pattern})(\\s|$)`, 'i');
					}

					function matchesTags(text, includedTags, excludedTags) {
						const includeRegex = buildTagRegex(includedTags);
						const excludeRegex = buildTagRegex(excludedTags);

						return includeRegex.test(text) && !excludeRegex.test(text);
					}

					const regex = /(^|\s)#live(\s|$)/i;
					if (regex.test(item["media:group"]?.["media:description"])) {
						console.log(`video: "${item.id}" constains #live`);
						continue;
					}

					YtNewestVid.id = item.id;
					YtNewestVid.title = item.title;
					YtNewestVid.desc = "" + item["media:group"]?.["media:title"];
					YtNewestVid.url = item.link;
					break;
				}

				// Check for no videos
				if (YtNewestVid.id == null) {
					console.error("YT channel has no videos");
					continue;
				}

				// Check if the newest video we just found is the same as the one one record. If it's different then we need to do a notification.
				if (YtNewestVid.id !== trackedChannel.lastVidId) {

					newYoutubeData.trackedChannels[i].lastVidId = YtNewestVid.id;

					console.log("new video... set tracked channel to " + YtNewestVid.id);

					// Since we have a new video, loop through every notification location and send the notification messages.
					for (notificationLocation of trackedChannel.notificationLocations) {
						console.log("Because there is a new video, we are notifying: " + notificationLocation.guildId)

						const guild = await client.guilds.fetch(notificationLocation.guildId);
						const channel = await guild.channels.fetch(notificationLocation.channelId);

						const embed = new EmbedBuilder()
							.setColor(0x0099FF)
							.setTitle(YtNewestVid.title)
							.setURL(YtNewestVid.url)
							.setImage(`https://img.youtube.com/vi/${YtNewestVid.id.slice(9)}/maxresdefault.jpg`)
							.setDescription(YtNewestVid.desc.substring(0, 40));

						await channel.send({ embeds: [embed] })
					}

				}
			}

			fs.writeFileSync((`${__dirname}/../json/youtube-data.json`), JSON.stringify(newYoutubeData));

		}
	},
};
