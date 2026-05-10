const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔒 HONEYPOT CHANNEL ID
const HONEYPOT_CHANNEL_ID = "1502873326014435388";

// 🔒 WHITELIST ROLES (REPLACE WITH REAL ROLE IDS)
const WHITELIST_ROLE_IDS = [
  "1352840869514051639",
  "1368901928498495589",
  "1477667283387289663",
  "1477667526249943140"
];

// 📩 DM MESSAGE
const dmMessage = `
System Notice

You’ve been removed from the server by the 1132 Security Bot.

Reason:
• Direct messaging in a restricted channel

This space is structured to protect flow, privacy, and channel intent.

What this means for you:
• Some channels are read-only or interaction-limited
• Messaging there triggers automatic enforcement
• This action is not personal

If you believe this was a mistake, you may reach out to a moderator for review.

⸻

Reminder for future access:
• Read channel descriptions before interacting
• Respect interaction boundaries per channel
• When in doubt, observe first, engage second
`;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // 🔒 ADMIN BYPASS
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  // 🔒 ROLE WHITELIST BYPASS
  const isWhitelisted = message.member.roles.cache.some(role =>
    WHITELIST_ROLE_IDS.includes(role.id)
  );
  if (isWhitelisted) return;

  // 🎯 HONEYPOT TRIGGER
  if (message.channel.id === HONEYPOT_CHANNEL_ID) {
    try {
      await message.author.send(dmMessage);
    } catch (err) {
      console.log("DM failed (user has DMs disabled)");
    }

    try {
      await message.member.kick("Honeypot trigger");
      console.log(`[HONEYPOT] Kicked ${message.author.tag}`);
    } catch (err) {
      console.log("Kick failed:", err);
    }
  }
});

client.login(process.env.TOKEN);
