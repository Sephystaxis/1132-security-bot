require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= SAFETY =================
if (!process.env.TOKEN) {
  console.error("❌ TOKEN missing in Railway Variables");
  process.exit(1);
}

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

// 💰 MEMORY ECONOMY
const users = {};

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

// ================= MESSAGE HANDLER =================
client.on("messageCreate", async (message) => {
  try {
    if (!message.guild) return;
    if (message.author.bot) return;

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

    // ================= HONEYPOT FIRST =================
    if (message.channel.id === HONEYPOT_CHANNEL_ID) {
      try {
        await message.author.send(
          `System Notice:\nYou were removed by 1132 Security Bot.`
        );
      } catch {}

      try {
        await message.member.kick("Honeypot trigger");
      } catch (err) {
        console.log("Kick failed:", err);
      }

      return; // STOP EVERYTHING HERE
    }

    // ================= ADMIN BYPASS =================
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return;
    }

    // ================= ROLE BYPASS =================
    const isWhitelisted = message.member.roles.cache.some(role =>
      WHITELIST_ROLE_IDS.includes(role.id)
    );
    if (isWhitelisted) return;

    // ================= PASSIVE EARN =================
    const now = Date.now();
    if (now - user.lastMessage > 60000) {
      user.balance += Math.floor(Math.random() * 10) + 5;
      user.lastMessage = now;
    }

    // ================= COMMAND CHECK =================
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    // 💰 BALANCE
    if (cmd === "bal") {
      return message.reply(`💰 You have **${user.balance} Fibers**`);
    }

    // 🎁 DAILY
    if (cmd === "daily") {
      if (now - user.lastDaily < 86400000) {
        return message.reply("⏳ Already claimed daily reward.");
      }

      user.balance += 100;
      user.lastDaily = now;

      return message.reply("🎁 You received **100 Fibers**!");
    }

    // 🎮 JANKEN
    if (cmd === "janken") {
      const choices = ["rock", "paper", "scissors"];
      const player = args[0];

      if (!choices.includes(player)) {
        return message.reply("Use: !janken rock/paper/scissors");
      }

      const bot = choices[Math.floor(Math.random() * choices.length)];

      if (player === bot) {
        return message.reply(`🤝 Draw! Bot chose ${bot}`);
      }

      const win =
        (player === "rock" && bot === "scissors") ||
        (player === "paper" && bot === "rock") ||
        (player === "scissors" && bot === "paper");

      if (win) {
        user.balance += 25;
        return message.reply(`🎉 You win! Bot chose ${bot} (+25 Fibers)`);
      } else {
        user.balance = Math.max(0, user.balance - 10);
        return message.reply(`💀 You lose! Bot chose ${bot} (-10 Fibers)`);
      }
    }

    // 🎳 BOWLING
    if (cmd === "bowl") {
      let pins = ["🎳", "📍", "📍", "📍", "📍", "📍", "📍"];

      const msg = await message.reply(`🎳 Bowling Lane\n${pins.join(" ")}`);

      let i = 6;

      const interval = setInterval(async () => {
        try {
          if (i <= 0) {
            clearInterval(interval);
            user.balance += 150;
            return msg.edit("💥 STRIKE! +150 Fibers");
          }

          pins[i] = "💥";
          i--;

          await msg.edit(`🎳 Bowling Lane\n${pins.join(" ")}`);
        } catch (err) {
          clearInterval(interval);
          console.log("Bowling error:", err);
        }
      }, 800);
    }

  } catch (err) {
    console.log("Handler error:", err);
  }
});

// ================= LOGIN =================
client.login(TOKEN);
