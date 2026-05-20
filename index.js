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
System Notice

You’ve been removed from the server by the 1132 Security Bot.

Reason:
• Direct messaging in a restricted channel

This action is not personal.
`;

// =========================
// READY
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
  // ADMIN BYPASS
  // =========================
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  // =========================
  // ROLE WHITELIST BYPASS
  // =========================
  const isWhitelisted = message.member.roles.cache.some(role =>
    WHITELIST_ROLE_IDS.includes(role.id)
  );
  if (isWhitelisted) return;

  // =========================
  // HONEYPOT SYSTEM
  // =========================
  if (message.channel.id === HONEYPOT_CHANNEL_ID) {
    try {
      await message.author.send(dmMessage);
    } catch {
      console.log("DM failed");
    }

    try {
      await message.member.kick("Honeypot trigger");
      console.log(`[HONEYPOT] Kicked ${message.author.tag}`);
    } catch (err) {
      console.log("Kick failed:", err);
    }

    return;
  }

  // =========================
  // SAFE COMMAND (TEST)
  // =========================
  if (message.content === "+ping") {
    message.reply("🏓 1132 bot is online");
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);
