require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= CONFIG =================
const PREFIX = "!";
const TOKEN = process.env.TOKEN;

// 🔒 HONEYPOT CHANNEL
const HONEYPOT_CHANNEL_ID = "1502873326014435388";

// 🔒 WHITELIST ROLES
const WHITELIST_ROLE_IDS = [
  "1352840869514051639",
  "1368901928498495589",
  "1477667283387289663",
  "1477667526249943140"
];

// 💰 SIMPLE ECONOMY (in-memory)
const users = {};

// ================= READY =================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= MESSAGE SYSTEM =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const userId = message.author.id;

  // INIT USER
  if (!users[userId]) {
    users[userId] = {
      balance: 0,
      lastMessage: 0,
      lastDaily: 0
    };
  }

  const user = users[userId];

  // 🔒 ADMIN BYPASS
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  // 🔒 ROLE BYPASS
  const isWhitelisted = message.member.roles.cache.some(role =>
    WHITELIST_ROLE_IDS.includes(role.id)
  );
  if (isWhitelisted) return;

  // 💰 PASSIVE EARNING
  const now = Date.now();
  if (now - user.lastMessage > 60000) {
    user.balance += Math.floor(Math.random() * 10) + 5;
    user.lastMessage = now;
  }

  // ================= COMMANDS =================
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // 💰 BALANCE
  if (cmd === "bal") {
    return message.reply(`💰 You have **${user.balance} Fibers**`);
  }

  // 🎁 DAILY
  if (cmd === "daily") {
    const now = Date.now();

    if (now - user.lastDaily < 86400000) {
      return message.reply("⏳ Already claimed daily.");
    }

    user.balance += 100;
    user.lastDaily = now;

    return message.reply("🎁 You claimed 100 Fibers!");
  }

  // 🎮 JANKEN
  if (cmd === "janken" || cmd === "rps") {
    const choices = ["rock", "paper", "scissors"];
    const player = args[0];

    if (!choices.includes(player)) {
      return message.reply("Use: !janken rock/paper/scissors");
    }

    const bot = choices[Math.floor(Math.random() * choices.length)];

    let result = "";

    if (player === bot) {
      result = "🤝 Draw";
    } else if (
      (player === "rock" && bot === "scissors") ||
      (player === "paper" && bot === "rock") ||
      (player === "scissors" && bot === "paper")
    ) {
      user.balance += 25;
      result = "🎉 You win +25 Fibers!";
    } else {
      user.balance -= 10;
      result = "💀 You lost -10 Fibers!";
    }

    return message.reply(`You: ${player}\nBot: ${bot}\n${result}`);
  }

  // 🎳 BOWLING GAME
  if (cmd === "bowl") {
    let pins = ["🎳", "📍", "📍", "📍", "📍", "📍", "📍"];

    const msg = await message.reply(`🎳 Bowling Lane\n\n${pins.join(" ")}`);

    let remaining = 6;

    const interval = setInterval(async () => {
      if (remaining <= 0) {
        clearInterval(interval);
        user.balance += 150;
        return msg.edit("💥 STRIKE! You earned 150 Fibers!");
      }

      pins[remaining] = "💥";
      remaining--;

      await msg.edit(`🎳 Bowling Lane\n\n${pins.join(" ")}`);
    }, 800);
  }

  // ================= HONEYPOT =================
  if (message.channel.id === HONEYPOT_CHANNEL_ID) {
    try {
      await message.author.send("You were removed by 1132 Security Bot.");
    } catch {}

    try {
      await message.member.kick("Honeypot trigger");
    } catch (err) {
      console.log("Kick failed:", err);
    }
  }
});

client.login(TOKEN);Reason:
• Direct messaging in a restricted channel

This action is automatic and not personal.
`;

// ===================== READY =====================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ===================== MESSAGE SYSTEM =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const userId = message.author.id;

  // INIT USER
  if (!users[userId]) {
    users[userId] = {
      balance: 0,
      lastDaily: 0,
      lastMessage: 0
    };
  }

  const user = users[userId];

  // 🔒 ADMIN BYPASS
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  // 🔒 ROLE WHITELIST BYPASS
  const isWhitelisted = message.member.roles.cache.some(role =>
    WHITELIST_ROLE_IDS.includes(role.id)
  );
  if (isWhitelisted) return;

  // 💰 PASSIVE EARNING (chat reward cooldown)
  const now = Date.now();
  if (now - user.lastMessage > 60000) {
    const earned = Math.floor(Math.random() * 10) + 5;
    user.balance += earned;
    user.lastMessage = now;
  }

  // ================= COMMANDS =================
  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // 💰 BALANCE
  if (cmd === "bal") {
    return message.reply(`💰 You have **${user.balance} Fibers**.`);
  }

  // 🎁 DAILY
  if (cmd === "daily") {
    const now = Date.now();
    if (now - user.lastDaily < 86400000) {
      return message.reply("⏳ You already claimed daily reward.");
    }

    user.balance += 100;
    user.lastDaily = now;

    return message.reply("🎁 You claimed **100 Fibers**!");
  }

  // 🎮 JANKEN POI
  if (cmd === "janken" || cmd === "rps") {
    const choices = ["rock", "paper", "scissors"];
    const player = args[0]?.toLowerCase();

    if (!choices.includes(player)) {
      return message.reply("Use: !janken rock/paper/scissors");
    }

    const bot = choices[Math.floor(Math.random() * choices.length)];

    let result = "";

    if (player === bot) {
      result = "🤝 Draw!";
    } else if (
      (player === "rock" && bot === "scissors") ||
      (player === "paper" && bot === "rock") ||
      (player === "scissors" && bot === "paper")
    ) {
      user.balance += 25;
      result = "🎉 You win +25 Fibers!";
    } else {
      user.balance = Math.max(0, user.balance - 10);
      result = "💀 You lost -10 Fibers!";
    }

    return message.reply(`You: ${player}\nBot: ${bot}\n\n${result}`);
  }

  // 🎳 BOWLING GAME
  if (cmd === "bowl") {
    let pins = ["🎳", "📍", "📍", "📍", "📍", "📍", "📍"];

    const msg = await message.reply(`🎳 Bowling Lane\n\n${pins.join(" ")}`);

    let remaining = 6;

    const interval = setInterval(async () => {
      if (remaining <= 0) {
        clearInterval(interval);

        user.balance += 150;

        return msg.edit("💥 STRIKE!\n\nYou earned 150 Fibers!");
      }

      pins[remaining] = "💥";
      remaining--;

      await msg.edit(`🎳 Bowling Lane\n\n${pins.join(" ")}`);
    }, 800);
  }

  // ================= HONEYPOT =================
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
  }
});

client.login(process.env.TOKEN);
