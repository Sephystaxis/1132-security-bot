const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

// =========================
// BOT SETUP
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

// =========================
// CONFIG
// =========================
const HONEYPOT_CHANNEL_ID = "1502873326014435388";
const STAFF_CHANNEL_ID = process.env.STAFF_CHANNEL_ID;

const WHITELIST_ROLE_IDS = [
  "1352840869514051639",
  "1368901928498495589",
  "1477667283387289663",
  "1477667526249943140"
];

// =========================
// STORAGE
// =========================
const tickets = new Map();

// =========================
// DM MESSAGE (HONEYPOT)
// =========================
const dmMessage = `
System Notice

You’ve been removed from the server by the 1132 Security Bot.

Reason:
• Direct messaging in a restricted channel

This space is structured to protect flow, privacy, and channel intent.

This action is not personal.
`;

// =========================
// READY EVENT
// =========================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// =========================
// MAIN MESSAGE HANDLER
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
    } catch {}

    try {
      await message.member.kick("Honeypot trigger");
      console.log(`[HONEYPOT] Kicked ${message.author.tag}`);
    } catch (err) {
      console.log("Kick failed:", err);
    }
    return;
  }

  // =========================
  // MODMAIL (USER DM → STAFF)
  // =========================
  if (message.channel.type === 1) {
    const staffChannel = await client.channels.fetch(STAFF_CHANNEL_ID);

    let threadId = tickets.get(message.author.id);
    let thread;

    if (!threadId) {
      thread = await staffChannel.threads.create({
        name: `ticket-${message.author.username}`,
        autoArchiveDuration: 10080
      });

      tickets.set(message.author.id, thread.id);
    } else {
      thread = await staffChannel.threads.fetch(threadId);
    }

    await thread.send(`📩 **${message.author.tag}:** ${message.content}`);
    return;
  }

  // =========================
  // MODMAIL (STAFF → USER DM)
  // =========================
  if (message.channel.isThread()) {
    const entry = [...tickets.entries()]
      .find(([_, t]) => t === message.channel.id);

    if (!entry) return;

    const user = await client.users.fetch(entry[0]);

    await user.send(`💬 **1132 Support:** ${message.content}`);
    return;
  }

  // =========================
  // DIRECT MESSAGE COMMAND
  // =========================
  if (message.content.startsWith("+dm ")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const args = message.content.split(" ");
    const userId = args[1];
    const text = args.slice(2).join(" ");

    try {
      const user = await client.users.fetch(userId);
      await user.send(`💬 **1132 Staff:** ${text}`);
      message.reply("✅ Message sent.");
    } catch {
      message.reply("❌ Failed to send message.");
    }
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);
