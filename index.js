require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

// ================= SAFE CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= SAFETY CHECK =================
if (!process.env.TOKEN) {
  console.error("❌ TOKEN missing in environment variables");
  process.exit(1);
}

// ================= CONFIG =================
const PREFIX = "!";
const TOKEN = process.env.TOKEN;

// 🔒 HONEYPOT
const HONEYPOT_CHANNEL_ID = "1502873326014435388";

// 🔒 WHITELIST ROLES
const WHITELIST_ROLE_IDS = [
  "1352840869514051639",
  "1368901928498495589",
  "1477667283387289663",
  "1477667526249943140"
];

// 💰 SIMPLE ECONOMY (RAM ONLY)
const users = {};

// ================= READY EVENT =================
client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
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

    // 🔒 ADMIN BYPASS
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // 🔒 ROLE BYPASS
    const isWhitelisted = message.member.roles.cache.some(role =>
      WHITELIST_ROLE_IDS.includes(role.id)
    );
    if (isWhitelisted) return;

    // 💰 PASSIVE EARN (chat reward)
    const now = Date.now();
    if (now - user.lastMessage > 60000) {
      user.balance += Math.floor(Math.random() * 10) + 5;
      user.lastMessage = now;
    }

    // ================= COMMAND SYSTEM =================
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
        return message.reply("⏳ You already claimed your daily reward.");
      }

      user.balance += 100;
      user.lastDaily = now;

      return message.reply("🎁 You received **100 Fibers**!");
    }

    // 🎮 JANKEN POI
    if (cmd === "janken") {
      const choices = ["rock", "paper", "scissors"];
      const player = args[0];

      if (!choices.includes(player)) {
        return message.reply("Use: !janken rock/paper/scissors");
      }

      const bot = choices[Math.floor(Math.random() * choices.length)];

      let result;

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
        try {
          if (remaining <= 0) {
            clearInterval(interval);
            user.balance += 150;
            return msg.edit("💥 STRIKE! +150 Fibers");
          }

          pins[remaining] = "💥";
          remaining--;

          await msg.edit(`🎳 Bowling Lane\n\n${pins.join(" ")}`);
        } catch (err) {
          clearInterval(interval);
          console.log("Bowling error:", err);
        }
      }, 800);
    }

    // 🔒 HONEYPOT SYSTEM
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

  } catch (err) {
    console.log("❌ Message handler error:", err);
  }
});

// ================= LOGIN =================
client.login(TOKEN);
