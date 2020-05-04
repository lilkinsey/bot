const { Client } = require("discord.js");
const BookmanDB = require("bookman");
const client = new Client();
const database = new BookmanDB("langData");
const Discord = require('discord.js');
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const db = require("quick.db");
require('./util/eventLoader')(client);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};


client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);

// DIL \\
client.on("message", message => {
	let langFile = returnLangFile(message.guild);
	if (message.content == "test") {
		message.channel.send(langFile["test_mesajı"]);
	}
	if (message.content == "deneme") {
		message.channel.send(langFile["deneme_başarılı"]);
	}
	if (message.content == "dil tr") {
		db.set(`lang.${message.guild.id}`, "tr");
		message.channel.send(langFile["dil_degisti"]);
	}
  if (message.content == "dil en") {
		db.set(`lang.${message.guild.id}`, "en");
		message.channel.send(langFile["dil_degisti"]);
	}

});

function returnLangFile(guild) {
  let dili;
  let dil = db.fetch(`teyit.${dili}`);  

  let lang = db.get(`lang.${guild.id}`) ;
  if (lang != "en" && lang != "tr") lang = "tr";
  switch (lang) {
    case "tr":
      return require("./lang/tr.json");
    case "en":
      return require("./lang/en.json");
  }
}
// DIL \\

// JAİL \\
client.on("guildMemberAdd", async member => {
  let cezalan = db.get(`ceza.${member.guild.id}`);
  if (cezalan.some(cezali => member.id === cezali.slice(1))) {
    setTimeout(() => {
      member.setRoles(["706901136807952485"]);
    }, 2000);
    member.guild.channels.get('706901358598684702').send(`${member} üyesi sunucuya girdi ve cezalıya atıldı!`);
    return
  };
});