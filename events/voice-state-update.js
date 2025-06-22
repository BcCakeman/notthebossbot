const { Events, ChannelType } = require('discord.js');
const fs = require("fs");

module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
	async execute(oldState, newState) {

		let hubConfig = JSON.parse(fs.readFileSync(`${__dirname}/../json/hub-config.json`, "utf-8"));

		// if nobody is in the channel that was left, AND it was a hub channel, delete it
		if ((oldState.channel?.members === undefined || oldState.channel?.members.size === 0) && oldState.channel != null){
			console.log(`User ${newState.member.user.tag} left a channel ${oldState.channel.name} which is now empty`);
			if (hubConfig.tempChannels.includes(oldState.channel.id)) {
				
				oldState.channel.delete();
				for (let i = hubConfig.tempChannels.length; i--;) if (hubConfig.tempChannels[i] === oldState.channel) hubConfig.tempChannels.splice(i, 1);
			}	
		}

		// if someone just joined a hub channel, create a tempChannel and move them to it
		if (newState.channel && hubConfig.hubChannels.includes(newState.channel.id)) {

			console.log(`${newState.member.user.tag} joined a HUB channel ${newState.channel}`);

			const newChannel = await newState.guild.channels.create({
				name: `${newState.member.user.username}'s Channel`,
				type: ChannelType.GuildVoice,
				parent: newState.channel.parent,
			});

			newState.member.voice.setChannel(newChannel);
			hubConfig.tempChannels.push(newChannel.id);
		}

		fs.writeFileSync((`${__dirname}/../json/hub-config.json`), JSON.stringify(hubConfig));
	}
}