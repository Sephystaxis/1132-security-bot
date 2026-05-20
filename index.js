const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

// =========================
// BOT SETUP
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// =========================
// CONFIG
// =========================
const HONEYPOT_CHANNEL_ID = "1502873326014435388";

const WHITELIST_ROLE_IDS = [
  "1352840869514051639",
  "1368901928498495589",
  "1477667283387289663",
  "1477667526249943140"
];

// =========================
// DM MESSAGE
// =========================
const dmMessage = `
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

Reset your password and join the server once you have secured your account
https://discord.gg/wanwantritu
`;

// =========================
// READY EVENT
// =========================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// =========================
// MESSAGE HANDLER
// =========================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // =========================
  // HONEYPOT SYSTEM
  // =========================
  if (message.channel.id === HONEYPOT_CHANNEL_ID) {
    try {
      await message.delete();
    } catch (err) {
      console.log("Delete failed:", err);
    }

    // admin bypass
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // whitelist bypass
    const isWhitelisted = message.member.roles.cache.some(role =>
      WHITELIST_ROLE_IDS.includes(role.id)
    );
    if (isWhitelisted) return;

    try {
      await message.member.kick("Honeypot trigger - restricted channel message");
      console.log(`[HONEYPOT] Kicked ${message.author.tag}`);
    } catch (err) {
      console.log("Kick failed:", err);
    }

    try {
      await message.author.send(dmMessage);
    } catch (err) {
      console.log("DM failed (user blocked DMs)");
    }

    return;
  }

  // =========================
  // TEST COMMAND
  // =========================
  if (message.content === "+ping") {
    message.reply("🏓 1132 bot is online");
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);
