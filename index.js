const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// YOUR CHANNEL ID
const HONEYPOT_CHANNEL_ID = "1502873326014435388";

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === HONEYPOT_CHANNEL_ID) {
    try {
      await message.member.kick("Honeypot trigger");
      console.log(`Kicked ${message.author.tag}`);
    } catch (err) {
      console.log(err);
    }
  }
});

client.login(process.env.TOKEN);
