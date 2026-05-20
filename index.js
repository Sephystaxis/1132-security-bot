require("dotenv").config();

const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

if (!process.env.TOKEN) {
  console.error("TOKEN missing");
  process.exit(1);
}

const PREFIX = "!";
const users = {};

const HONEYPOT_CHANNEL_ID = "1502873326014435388";

const WHITELIST_ROLE_IDS = [
  "1352840869514051639",
  "1368901928498495589",
  "1477667283387289663",
  "1477667526249943140"
];

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const id = message.author.id;

  if (!users[id]) {
    users[id] = { balance: 0, lastDaily: 0, lastMsg: 0 };
  }

  const u = users[id];

  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const whitelisted = message.member.roles.cache.some(r =>
    WHITELIST_ROLE_IDS.includes(r.id)
  );
  if (whitelisted) return;

  const now = Date.now();

  if (now - u.lastMsg > 60000) {
    u.balance += Math.floor(Math.random() * 10) + 5;
    u.lastMsg = now;
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "bal") {
    return message.reply(`💰 ${u.balance} Fibers`);
  }

  if (cmd === "daily") {
    if (now - u.lastDaily < 86400000) {
      return message.reply("Already claimed.");
    }
    u.balance += 100;
    u.lastDaily = now;
    return message.reply("+100 Fibers");
  }

  if (cmd === "janken") {
    const c = ["rock", "paper", "scissors"];
    const p = args[0];

    if (!c.includes(p)) return message.reply("Use !janken rock/paper/scissors");

    const b = c[Math.floor(Math.random() * c.length)];

    if (p === b) return message.reply(`Draw: ${b}`);

    const win =
      (p === "rock" && b === "scissors") ||
      (p === "paper" && b === "rock") ||
      (p === "scissors" && b === "paper");

    if (win) {
      u.balance += 25;
      return message.reply(`You win! Bot: ${b}`);
    } else {
      u.balance -= 10;
      return message.reply(`You lose! Bot: ${b}`);
    }
  }

  if (cmd === "bowl") {
    let pins = ["🎳", "📍", "📍", "📍", "📍", "📍", "📍"];

    const msg = await message.reply(pins.join(" "));

    let i = 6;

    const interval = setInterval(async () => {
      if (i <= 0) {
        clearInterval(interval);
        u.balance += 150;
        return msg.edit("STRIKE +150");
      }

      pins[i] = "💥";
      i--;

      await msg.edit(pins.join(" "));
    }, 800);
  }

  if (message.channel.id === HONEYPOT_CHANNEL_ID) {
    try {
      await message.author.send("Removed by security bot");
      await message.member.kick("Honeypot");
    } catch {}
  }
});

client.login(process.env.TOKEN);
