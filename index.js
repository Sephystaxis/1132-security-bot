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

// whitelist roles
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
// HONEYPOT MESSAGE
// =========================
const dmMessage = `
System Notice

You’ve been removed from the server by the 1132 Security Bot.

Reason:
• Direct messaging in a restricted channel

This action is not personal.

Please review server rules before rejoining.
`;

// =========================
// READY
// =========================
client.once("ready", () => {
  console.log(`ONLINE AS ${client.user.tag}`);
});

// =========================
// MAIN LOGIC
// =========================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // =========================
  // GUILD ONLY CHECK
  // =========================
  const isGuild = !!message.guild;

  // =========================
  // HONEYPOT SYSTEM
  // =========================
  if (isGuild && message.channel.id === HONEYPOT_CHANNEL_ID) {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const isWhitelisted = message.member.roles.cache.some(role =>
      WHITELIST_ROLE_IDS.includes(role.id)
    );
    if (isWhitelisted) return;

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
  // MODMAIL (USER DM → STAFF THREAD)
  // =========================
  if (!isGuild) {
    try {
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
    } catch (err) {
      console.log("Modmail error:", err);
    }

    return;
  }

  // =========================
  // MODMAIL (STAFF REPLY → USER DM)
  // =========================
  if (message.channel.isThread()) {
    const entry = [...tickets.entries()]
      .find(([_, t]) => t === message.channel.id);

    if (!entry) return;

    try {
      const user = await client.users.fetch(entry[0]);

      await user.send(`💬 **1132 Support:** ${message.content}`);
    } catch {
      message.channel.send("❌ User cannot receive DMs (blocked or disabled).");
    }

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
      message.reply("❌ Could not send message (DM blocked).");
    }
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);
