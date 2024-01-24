const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs')
const uuid = require('uuid');
const chalk = require('chalk')
require('dotenv').config({ debug: process.env.DOTENV_DEBUG === 'true' })
const mess = require('./message');
const botToken = process.env.BOT_TOKEN;

const FormData = require('form-data');
const { MongoClient } = require('mongodb')
const bot = new TelegramBot(botToken, { polling: true });
const cased = require('./case');
cased(bot)
bot.on('polling_error', (error) => {
    console.log(error)
})

const uripublic = `mongodb+srv://lonely:aisbidiferf439d2kdm@cluster0.uuosbqp.mongodb.net`
const cse = new MongoClient(uripublic);
const pdatabase = cse.db('chloesay');
const pcollection = pdatabase.collection('lisensi');
const intro = `
▄▀█ █░█░█ █ █▄▀ █░█░█ █▀█ █▄▀
█▀█ ▀▄▀▄▀ █ █░█ ▀▄▀▄▀ █▄█ █░█

█▄▄ █▀█ ▀█▀
█▄█ █▄█ ░█░
`
console.log(chalk.greenBright(intro))
console.log(`Created by https://t.me/penyukaberuang
makasih buat kalian yang udh follow ch
yg ga follow gapapa kok ku jg paham
`)

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const caption = msg.caption || '';
  if (caption.startsWith('.addlist')) {
      const params = caption.substring('/addlist'.length).split('|');
      const nama = params[0] ? params[0].trim() : null;
      const info = params[1] ? params[1].trim() : null;

      const chatMember = await bot.getChatMember(chatId, msg.from.id);
      const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');

      if (!isAdmin) return bot.sendMessage(chatId, mess.notadmin);
      if (!nama || !info) return bot.sendMessage(chatId, `Gunakan dengan cara /addlist namaproduk|info produk`);
      const photoLength = msg.photo.length;
      let storagee
      const fileid = msg.photo[Math.max(photoLength - 1, 0)].file_id;
        await bot.downloadFile(fileid, "./temp").then((y) => {
storagee = y
        })
      const isavail = isAvaibleList(chatId, nama);
     

      if (isavail) return bot.sendMessage(chatId, `Produk *${nama}* Telah ada di data chat ini!`, { parse_mode: "Markdown" });
      try {
        const imageUrl = await TelegraPh(storagee);
        savedatalist(chatId, nama, info, imageUrl);

        bot.sendMessage(chatId, `Berhasil menambahkan *${nama}* kedalam list produk`, { parse_mode: "Markdown" });
    } catch (error) {
        console.error('Error:', error.message);
        bot.sendMessage(chatId, 'Error uploading image. Please try again.');
    } finally {
        fs.unlinkSync(storagee);
    }

  }
});
/*
Secret bot feature


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text
  if (process.env.ENABLE_MENFESS === 'true') {
    const hashtags = process.env.HASTAG_POST.split(', ');
    const containsHashtag = hashtags.some((hashtag) => messageText.includes(hashtag));

    if (containsHashtag) {
      const targetChannel = process.env.FORWARD_MENFESS_TARGET;
      bot.sendMessage(targetChannel, messageText).then((yes) => {
        const ggg = targetChannel.replace('@', '');
        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: '🙈 Lihat Menfess',
                url: `https://t.me/${ggg}/${yes.message_id}`,
              },
            ],
          ],
        };
        bot.sendMessage(chatId, 'Berhasil Memposting Menfessmu! Klik button dibawah untuk melihat', {
          reply_markup: JSON.stringify(replyMarkup),
        });
      })
    }
    else {
      return false;
    }
  }
  else{
    return false;
  }
});
*/
async function sup() {
  try {
    console.log(chalk.gray("[+] Checking Apikey validality before starting bot..."));
    await cse.connect();

    const api = process.env.AISBIR_KEY;
    const result = await pcollection.findOne({ apikey: api, name: process.env.AISBIR_USERNAME, license: "storeakamusanto" });
if(result.name && result.apikey) {
      console.log(chalk.cyanBright("[+] Apikey valid"))
      getBotInfo()
    } else {
      console.log(chalk.red('[+] API_Key Doesnt Valid in our database or maybe this apikey got revoked for security issue contact https://t.me/aisbirkoenz if you think this bug'));
      process.exit(1);
    }
  } finally {
    await cse.close();
  }
}

sup()

const userListFile = 'userlist.json';
function loadUserList() {
  try {
    const data = fs.readFileSync(userListFile);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

bot.on('message', (msg) => {
const chatId = msg.chat.id
    const nama = msg.text;
    let listData;
    try {
      const rawData = fs.readFileSync('./database/list.json');
      listData = JSON.parse(rawData);
    } catch (error) {
      console.error('Error reading the JSON file:', error.message);
      return;
    }
    const entry = listData.find(item => item.chatId === chatId && item.nama === nama);
    if (entry) {
      if (entry.image) {
        bot.sendPhoto(chatId, entry.image, { caption: entry.list, parse_mode: "Markdown",reply_to_message_id: msg.message_id }).catch((error) => {
          bot.sendPhoto(chatId, entry.image, { caption: entry.list,reply_to_message_id: msg.message_id })
          
        })
    } else {
        bot.sendMessage(chatId, entry.list, { parse_mode: "Markdown",reply_to_message_id: msg.message_id }).catch((error) => {
          bot.sendMessage(chatId, entry.list, { reply_to_message_id: msg.message_id })
        })
    }
    } else {
    return false;
    }

});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    const isurname = msg.from.first_name
    if(!msg.from.username && isurname !== "Telegram"){
      bot.restrictChatMember(chatId, msg.from.id, { can_send_messages: false });
        bot.sendMessage(chatId, `Ups, sepertinya kamu belum memasang username [${isurname}](tg://user?id=${msg.from.id}) Silakan pasang username dan jika kamu telah memasang  tekan tombol di bawah\n\n🚫 Bot membatasi kemampuan chatting!`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Verifikasi", callback_data: `verify_${msg.from.id}` }
                    ]
                ]
            },
            reply_to_message_id: msg.message_id
        });
        return;
    }
    const senderName = username ? `@${username}` : msg.from.first_name;
    let userList = loadUserList();
    const existingUserIndex = userList.findIndex((user) => user.id === userId);

    if (existingUserIndex !== -1) {
        userList[existingUserIndex].username = senderName;
        
    } else {
        userList.push({ id: userId, username: senderName });
        console.log(`[+] New user added: ${senderName}`);
    }
    saveUserList(userList);
  });
  function saveUserList(userList) {
    fs.writeFileSync(userListFile, JSON.stringify(userList));
  }
  bot.onText(/\.ban (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const usernameToKick = match[1];
  
    let userList = [];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
    const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
    if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  
    try {
      const data = fs.readFileSync('userlist.json', 'utf8');
      userList = JSON.parse(data);
    } catch (err) {
      console.error('Error reading user list:', err);
    }
  
    const userToKick = userList.find(user => {
      if (usernameToKick.startsWith('@')) {
        return user.username === usernameToKick;
      } else {
        return user.id.toString() === usernameToKick;
      }
    });
  
    if (userToKick) {
      const userIdToKick = userToKick.id;
      bot.banChatMember(chatId, userIdToKick)
        .then(() => {
          bot.sendMessage(chatId, `Berhasil mengeluarkan ${userToKick.username} Dari grub.`);
        })
        .catch(error => {
         if(error.message.includes("remove chat owner")){
          bot.sendMessage(chatId, 'Maaf! Kamu tidak dapat mengeluarkan admin');
         }
        else{
          bot.sendMessage(chatId, 'Sesuatu error telah terjadi!');
        }
        });
    } else {
      bot.sendMessage(chatId, `User dengan detail ${usernameToKick} tidak terdaftar dengan bot, setidaknya biarkan user membuat chat!`);
    }
  });

  bot.onText(/\.unban (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const usernameToKick = match[1];
  
    let userList = [];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
    const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
    if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  
    try {
      const data = fs.readFileSync('userlist.json', 'utf8');
      userList = JSON.parse(data);
    } catch (err) {
      console.error('Error reading user list:', err);
    }
  
    const userToKick = userList.find(user => {
      if (usernameToKick.startsWith('@')) {
        return user.username === usernameToKick;
      } else {
        return user.id.toString() === usernameToKick;
      }
    });
  
    if (userToKick) {
      const userIdToKick = userToKick.id;
      bot.unbanChatMember(chatId, userIdToKick)
        .then(() => {
          bot.sendMessage(chatId, `Berhasil mengeluarkan ${userToKick.username} Dari grub.`);
        })
        .catch(error => {
          console.error('Error kicking user:', error);
          bot.sendMessage(chatId, 'Sesuatu yang salah telah terjadi!');
        });
    } else {
      bot.sendMessage(chatId, `User dengan detail ${usernameToKick} tidak terdaftar dengan bot, setidaknya biarkan user membuat chat!`);
    }
  });


  bot.onText(/\.desc (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const desc = match[1];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
    const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
    if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  
   bot.setChatDescription(chatId, desc).then(() => {
    bot.sendMessage(chatId, `Berhasil Mengubah deskripsi grub`)
   })
  });

  bot.onText(/\.title (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const desc = match[1];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
    const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
    if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  
   bot.setChatTitle(chatId, desc).then(() => {
    bot.sendMessage(chatId, `Berhasil Mengubah deskripsi grub`)
   })
  });

bot.onText(/\.setbot (.+)/, async(msg, match) => {
    const chatId = msg.chat.id;
    const botName = match[1];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
    if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
    savedatabot(chatId, botName);
    bot.sendMessage(chatId, `Berhasil mengubah setbot menjadi ${botName}`);
});


bot.onText(/\.?setwelcome (.+)/s, async(msg, match) => {
    const chatId = msg.chat.id;
    const welcome = match[1];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
    savedatawelcome(chatId, welcome);
    bot.sendMessage(chatId, `Berhasil mengubah setwelcome`);
});
bot.onText(/\.?setleave (.+)/s, async(msg, match) => {
    const chatId = msg.chat.id;
    const left = match[1];
    const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
    savedataleft(chatId, left);
    bot.sendMessage(chatId, `Berhasil mengubah leave`);
});
bot.onText(/\.dellist (.+)/, async(msg, match) => {
  const chatId = msg.chat.id;
  const nameToDelete = match[1].trim().toLowerCase();
  const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  let listData;
  try {
    const rawData = fs.readFileSync('./database/list.json');
    listData = JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading the JSON file:', error.message);
    return;
  }
  const entryIndex = listData.findIndex(entry => entry.chatId === chatId && entry.nama.toLowerCase() === nameToDelete);

  if (entryIndex !== -1) {
    listData.splice(entryIndex, 1);
    try {
      fs.writeFileSync('./database/list.json', JSON.stringify(listData, null, 2));
      bot.sendMessage(chatId, `Produk dengan nama *${nameToDelete}* Berhasil dihapus.`, {parse_mode: "Markdown"});
    } catch (error) {
      console.error('Error updating the JSON file:', error.message);
    }
  } else {
    bot.sendMessage(chatId, `Produk dengan nama *${nameToDelete}* Tidak tersedia di chat ini.`, {parse_mode: "Markdown"});
  }
});

bot.onText(/\.addlist ([\s\S]+)/, async(msg, match) => {
const chatId = msg.chat.id
const params = match[1].split('|');
const nama = params[0] ? params[0].trim() : null;
    const info = params[1] ? params[1].trim() : null;
const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
if(!nama || !info) return bot.sendMessage(chatId, `Gunakan dengan cara /addlist namaproduk|info produk`)
const isavail = isAvaibleList(chatId, nama)

if(isavail) return bot.sendMessage(chatId, `Produk *${nama}* Telah ada di data chat ini!`, {parse_mode: "Markdown"});
const image = ""
savedatalist(chatId, nama, info, image);
    bot.sendMessage(chatId, `Berhasil menambahkan *${nama}* kedalam list produk`, {parse_mode: "Markdown"});

})
function TelegraPh (Path) {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new FormData();
			form.append("file", fs.createReadStream(Path))
			const data = await  axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}
/*
experimen jirrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
bot.on('photo', async (msg) => {
  const photoLength = msg.photo.length;
  console.log(msg.photo);
  const selectedFileId = msg.photo[Math.max(photoLength - 1, 0)].file_id;
  
  console.log('Selected: ' + selectedFileId);
});
*/

function isAvaibleList(chatId, name) {
  const filePath = './database/list.json';
  let existingData = [];

  try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
      if (!Array.isArray(existingData)) {
          existingData = [];
      }
  } catch (error) {
      console.log(error);
  }

  const existingIndex = existingData.findIndex(entry => entry.chatId === chatId && entry.nama === name);

  return existingIndex !== -1;
}
function savedatalist(chatId, nama, list, image) {
  const data = { chatId, nama, list, image };
  const filePath = './database/list.json';
  let existingData = [];

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    existingData = JSON.parse(fileContent);
    if (!Array.isArray(existingData)) {
      existingData = [];
    }
  } catch (error) {
    console.log(error);
  }
  existingData.push(data);

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
}
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const username = query.from.username;
  const groupUsername = query.message.chat.title;
  if (query.data.startsWith('verify_')) {
      const targetUserId = parseInt(query.data.split('_')[1]);
if(userId !== targetUserId) return bot.answerCallbackQuery(query.id, { text: `🚫 Verifikasi ini bukan untuk kamu`, show_alert: true });
      if (userId === targetUserId && username) {
          bot.restrictChatMember(chatId, userId, { can_send_messages: true });
          bot.deleteMessage(chatId, query.message.message_id)
          bot.answerCallbackQuery(query.id, { text: `✅ Verifikasi Berhasil!\nSelamat Datang di\n${groupUsername}`, show_alert: true });
      } else {
          bot.answerCallbackQuery(query.id, { text: '🚫 Verifikasi Gagal, Kamu tidak memasang username', show_alert: true });
      }
  }
});
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    const newMember = msg.new_chat_members[0];
    const groupUsername = msg.chat.title;
    const username =  msg.from.username ? msg.from.username : msg.from.first_name;
    const { chatId: foundChatId, welcome } = getBotwelcome(chatId);

    if (foundChatId) {
        const formattedWelcome = welcome.replace('@user', username).replace('@groupname', groupUsername);
        bot.sendMessage(chatId, formattedWelcome, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });

        if(!msg.from.username){
          bot.restrictChatMember(chatId, msg.from.id, { can_send_messages: false });
            bot.sendMessage(chatId, `Ups, sepertinya kamu belum memasang username [${isurname}](tg://user?id=${msg.from.id}) Silakan pasang username dan jika kamu telah memasang  tekan tombol di bawah\n\n🚫 Bot membatasi kemampuan chatting!`, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "✅ Verifikasi", callback_data: `verify_${msg.from.id}` }
                        ]
                    ]
                },
                reply_to_message_id: msg.message_id
            });
        }
    } else {
        const defaultWelcome = mess && mess.default_welcome ? mess.default_welcome : "👋🏻 Halo @user selamat datang di grup @groupname";
        const formattedWelcome = defaultWelcome.replace('@user', username).replace('@groupname', groupUsername);
        bot.sendMessage(chatId, formattedWelcome, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
    }
    function getBotwelcome(chatId) {
        const filePath = './database/setwelcome.json';
        let existingData = [];
    
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
            if (!Array.isArray(existingData)) {
                existingData = [];
            }
        } catch (error) {
            console.log(error);
        }
        const botInfo = existingData.find(entry => entry.chatId === chatId);
    
        if (botInfo) {
            return { chatId: botInfo.chatId, welcome: botInfo.welcome };
        } else {
            return { chatId: null, welcome: null };
        }
    }
});

bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    const groupUsername = msg.chat.title;
    const username = msg.from.username ? msg.from.username : msg.from.first_name;
    const { chatId: foundChatId, left } = getBotleft(chatId);
    if (foundChatId) {
        const formattedleft = left ? left.replace('@user', username).replace('@groupname', groupUsername) : "";
        bot.sendMessage(chatId, formattedleft, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
    } else {
        const defaultleft = mess && mess.default_left ? mess.default_left : "dadah @user gudbe @groupname";
        const formattedleft = defaultleft.replace('@user', username).replace('@groupname', groupUsername);
        bot.sendMessage(chatId, formattedleft, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
    }

    function getBotleft(chatId) {
        const filePath = './database/setleft.json';
        let existingData = [];

        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
            if (!Array.isArray(existingData)) {
                existingData = [];
            }
        } catch (error) {
            console.log(error);
        }
        const botInfo = existingData.find(entry => entry.chatId === chatId);

        if (botInfo) {
            return { chatId: botInfo.chatId, left: botInfo.left };
        } else {
            return { chatId: null, left: null };
        }
    }
});

bot.onText(/\.?setdone (.+)/s, async(msg, match) => {
  const chatId = msg.chat.id;
  const done = match[1];
  const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  savedatadone(chatId, done);
  bot.sendMessage(chatId, `Berhasil mengubah text Done`);

});
function savedatadone(chatId, done) {
  const data = { chatId, message: done };
  const filePath = './database/setdone.json';
  let existingData = [];

  try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
      if (!Array.isArray(existingData)) {
          existingData = [];
      }
  } catch (error) {
      console.log(error);
  }
  const existingIndex = existingData.findIndex(entry => entry.chatId === chatId);

  if (existingIndex !== -1) {
      existingData[existingIndex] = { ...existingData[existingIndex], ...data };
  } else {
      existingData.push(data);
  }
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
}



bot.onText(/\.?setproses (.+)/s, async(msg, match) => {
  const chatId = msg.chat.id;
  const proses = match[1];
  const chatMember = await bot.getChatMember(chatId, msg.from.id);
const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
if(!isAdmin) return   bot.sendMessage(chatId, mess.notadmin);
  savedataproses(chatId, proses);
  bot.sendMessage(chatId, `Berhasil mengubah text proses`);

});
function savedataproses(chatId, proses) {
  const data = { chatId, message: proses };
  const filePath = './database/setproses.json';
  let existingData = [];

  try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
      if (!Array.isArray(existingData)) {
          existingData = [];
      }
  } catch (error) {
      console.log(error);
  }
  const existingIndex = existingData.findIndex(entry => entry.chatId === chatId);

  if (existingIndex !== -1) {
      existingData[existingIndex] = { ...existingData[existingIndex], ...data };
  } else {
      existingData.push(data);
  }
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
}
function savedataleft(chatId, left) {
    const data = { chatId, left };
    const filePath = './database/setleft.json';
    let existingData = [];

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
            existingData = [];
        }
    } catch (error) {
        console.log(error);
    }
    const existingIndex = existingData.findIndex(entry => entry.chatId === chatId);

    if (existingIndex !== -1) {
        existingData[existingIndex] = { ...existingData[existingIndex], ...data };
    } else {
        existingData.push(data);
    }
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
}
function savedatawelcome(chatId, welcome) {
    const data = { chatId, welcome };
    const filePath = './database/setwelcome.json';
    let existingData = [];

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
            existingData = [];
        }
    } catch (error) {
        console.log(error);
    }
    const existingIndex = existingData.findIndex(entry => entry.chatId === chatId);

    if (existingIndex !== -1) {
        existingData[existingIndex] = { ...existingData[existingIndex], ...data };
    } else {
        existingData.push(data);
    }
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
}

function savedatabot(chatId, botName) {
    const data = { chatId, botName };
    const filePath = './database/bot.json';
    let existingData = [];

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
            existingData = [];
        }
    } catch (error) {
        console.log(error);
    }
    const existingIndex = existingData.findIndex(entry => entry.chatId === chatId);

    if (existingIndex !== -1) {
        existingData[existingIndex] = { ...existingData[existingIndex], ...data };
    } else {
        existingData.push(data);
    }
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
}
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const formatDate = (date) => {
      const options = {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
    
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(date);
    
      const formattedDate = parts
        .map((part) => (part.type === 'literal' ? part.value : part.value.padStart(2, '0')))
        .join('');
    
      return formattedDate;
    };
    
    const now = new Date();
    const formattedDateTime = formatDate(now);
    console.log(chalk.black.bgWhite(" [CMD] ")+' '+ chalk.bgGreen.black(formattedDateTime+ ' ')+ ' ' + chalk.bgBlue(messageText) +chalk.magenta('\n=> From ') + chalk.yellow(msg.from.username + " - "+  chatId) + '\n');// idk
})


async function getBotInfo() {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
       console.log(chalk.cyan('[+] Connecting to telegram bot...'))
        if (response.status === 200) {
            const data = response.data;
            if (data.ok) {
                console.log(chalk.italic(`Connected to = `) +  `{\n   username: ${data.result.username}\n    ID: ${data.result.id}\n }`);
            } else {
                console.error(`Error: ${data.description}`);
            }
        } else {
            console.error(`Error: Unable to fetch data. Status code: ${response.status}`);
        }
    } catch (error) {
        return false;
    }
}
