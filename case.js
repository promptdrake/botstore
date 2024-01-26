module.exports = (griz) => {
    const axios = require('axios');
    require('dotenv').config({ debug: process.env.DOTENV_DEBUG === 'true' });
    const mess = require('./message');
    const fs = require('fs')
    const moment = require('moment-timezone');
    function runtime(seconds) {

        seconds = Number(seconds);
    
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
    griz.on('text', async (msg) => {
        const chatId = msg.chat.id;
        const command = msg.text;
        const nganu = command.toLowerCase();
        const username = msg.from.username;
        const isOwner = msg.from.id == process.env.OWNER_ID;
        const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
        const chatMember = await griz.getChatMember(chatId, msg.from.id);
        const isAdmin = (chatMember.status === 'administrator' || chatMember.status === 'creator' || chatMember.status === 'Admin');
        
        const senderName = "@"+msg.from.username ? "@"+msg.from.username : msg.from.first_name;
        const args = command.split(/\s+/);
        const text = args.slice(2).join(" ");
        const reply = (datas) => {
            griz.sendMessage(chatId, datas, { parse_mode: "Markdown", reply_to_message_id: msg.message_id });
        };

        switch (nganu) {
            
            case "\/start": {

                reply(`🛍️ Halo ${senderName}, Ini adalah bot asistent!`, { parse_mode: "Markdown" });
            }
                break;
                case "\.title":
                    reply("Gunakan command dengan cara .title namagrub")
                break
                case "\.desc":
                    reply("Gunakan command dengan cara .desc deskripsi grub")
                break

                case "linkgrub":
                    case "linkgc":
                        case "linktele":
                            case "\.linkgc":
                    const gcname = msg.chat.title;
                    const link = await griz.exportChatInviteLink(msg.chat.id)
                    reply(`👻 Link *${gcname}* Silahkan share ke teman kalian cuy!\n\n${link}`)
                    break

                case 'close': 
                case '\/close':
                    case '\.close':
                        if(!isAdmin) return reply(mess.notadmin)
                const restrictOptions = {
                    can_send_messages: false,
                    can_send_media_messages: false,
                };
                griz.setChatPermissions(msg.chat.id, restrictOptions)
                    .then(() => {
                        reply('Sukses mengijinkan hanya admin yang dapat mengirim pesan.');
                    })
                    .catch((error) => {
                        console.error('Error updating permissions:', error.message);
                        reply('Bot Bukan admin!');
                    });
                break;
case 'updatelist':
    case '\."updatelist':
        reply("Gunakan dengan cara .updatelist namaitem|namaproduk")
        break
                case 'help':
                    case '\.help':
                     case 'menu':
                        case '\.menu':
reply(`*▣───「 Musanto Chan 」───▣*

Bot store yang terinsipirasi dari bot wangsaf
Untuk menampilkan list produk atau apalah

–  A D M I N

┌  ◦  .setwelcome
│  ◦  .setleft
│  ◦  .ban
│  ◦  .unban
│  ◦  .open
│  ◦  .linkgc
│  ◦  .desc
└  ◦  .setbot


–  S T O R E

┌  ◦  .list
│  ◦  .addlist
│  ◦  .updatelist
│  ◦  .dellist
│  ◦  .setproses
│  ◦  .setdone
│  ◦  .proses
└  ◦  .done
`)
                        break

case 'proses':
    case 'p':
    if(!isAdmin) return reply(mess.notadmin)
   if(!msg.reply_to_message.from.id) return reply("Reply pesanan yang akan di proses")
   const userlist = JSON.parse(fs.readFileSync('./userlist.json', 'utf8'));
   const setprosesData = JSON.parse(fs.readFileSync('./database/setproses.json', 'utf8'));
   const user = userlist.find((u) => u.id === msg.reply_to_message.from.id);
   const chatId = msg.chat.id;
   const setprosesEntry = setprosesData.find(entry => entry.chatId === msg.chat.id);
   const currentDate = moment().format('DD-MM-YYYY');
   const currentJam = moment().tz('Asia/Jakarta').format('HH:mm');
   if (user && setprosesEntry) {
    const prosesMessage = setprosesEntry.message
        .replace('@user', `${user.username}`)
        .replace('@pesan', msg.reply_to_message.text)
        .replace('@tanggal', currentDate)
        .replace('@jam', currentJam);

    griz.sendMessage(msg.chat.id, `${prosesMessage}`, { parse_mode: "Markdown" });
} else if (user && !setprosesEntry) {
    const prosesMessage = `⌛️ *TRANSAKSI PENDING*
━━━━━━━━━━━━━━
\`\`\`🛍️Detail:

📆 Tanggal : ${currentDate}
⌚ JAM     : ${currentJam} WIB
✨ STATUS  : Pending

\`\`\`
📝 Catatan :
${msg.reply_to_message.text}

Pesanan ${user.username} sedang di proses!`;

    griz.sendMessage(msg.chat.id, `${prosesMessage}`, { parse_mode: "Markdown" });
}
    break

    case 'done':
        case 'd':
        if(!isAdmin) return reply(mess.notadmin)
       if(!msg.reply_to_message.from.id) return reply("Reply pesanan yang akan di proses")
       const userlistt = JSON.parse(fs.readFileSync('./userlist.json', 'utf8'));
       const setdoneData = JSON.parse(fs.readFileSync('./database/setdone.json', 'utf8'));
       const userr = userlistt.find((u) => u.id === msg.reply_to_message.from.id);
       const setdoneEntry = setdoneData.find(entry => entry.chatId === msg.chat.id);
       const currentDatee = moment().format('DD-MM-YYYY');
       const currentJamm = moment().tz('Asia/Jakarta').format('HH:mm');
       if (userr && setdoneEntry) {
        const prosesMessage = setdoneEntry.message
            .replace('@user', `${userr.username}`)
            .replace('@pesan', msg.reply_to_message.text)
            .replace('@tanggal', currentDatee)
            .replace('@jam', currentJamm);
    
        griz.sendMessage(msg.chat.id, `${prosesMessage}`, { parse_mode: "Markdown" });
    } else if (userr && !setdoneEntry) {
        const prosesMessage = `💸 *TRANSAKSI BERHASIL*
━━━━━━━━━━━━━━
\`\`\`🛍️Detail:
    
📆 Tanggal : ${currentDatee}
⌚ JAM     : ${currentJamm} WIB
✨ STATUS  : BERHASIL
    
\`\`\`
📝 Catatan :
${msg.reply_to_message.text}
    
Pesanan ${userr.username} Berhasil dikirimkan silahkan
dilihat di chat pribadi! terimakasih telah membeli produk
di toko kami!`;
    
        griz.sendMessage(msg.chat.id, `${prosesMessage}`, { parse_mode: "Markdown" });
    }
        break


                case 'list':
                    const jakartaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
                    const options = { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' };
                    const formattedDate = new Intl.DateTimeFormat('id-ID', options).format(new Date(jakartaTime));
                
                    if (!isGroup) return reply(mess.notgroup);
                
                    const rawData = fs.readFileSync('./database/list.json');
                    const db = JSON.parse(rawData);
                
                    const groupEntries = db.filter(entry => entry.chatId === msg.chat.id);
                
                    if (groupEntries.length === 0) {
                        return reply('List tidak ada didalam grup ini');
                    }
                
                    const skrg = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
                    const pokonyajam = new Date(skrg).getHours();
                
                    let ucapan;
                
                    if (pokonyajam >= 5 && pokonyajam < 12) {
                        ucapan = "Pagi 🌥️";
                    } else if (pokonyajam >= 12 && pokonyajam < 18) {
                        ucapan = "Siang ☀️";
                    } else {
                        ucapan = "Malam 🌙";
                    }
                
                    const response = `🛍️ List Grub *${msg.chat.title}*
Tanggal: ${formattedDate}
                
Halo ${senderName}
Selamat ${ucapan}
Ketik nama untuk menampilkan detail list

${groupEntries.map(group => `*• ${group.nama}*`).join('\n').toUpperCase()}
                
Dapatkan Nama dengan mengetik list produk contoh *Payment*
Chat admin untuk melakukan orderan!`;
                
                    reply(response);
                
                    break;
                
                
                case 'open': 
                case '\/open':
                    case '\.open':
                        
                        case '\#open':
                            if(!isAdmin) return reply(mess.notadmin)
                const ijoi = {
                    can_send_messages: true,
                    can_send_media_messages: true,
                };
                griz.setChatPermissions(msg.chat.id, ijoi)
                    .then(() => {
                       reply('Sukses mengijinkan Semua member yang dapat mengirim pesan');
                    })
                    .catch((error) => {
                        console.error('Error updating permissions:', error.message);
                       reply('Bot Bukan admin!');
                    });
                break

                case '\.id':
                    reply(`ID: ${msg.chat.id}
USER ID: ${msg.from.id}`)
                    break

case "\.setwelcome": 
case "setwelcome":
if(!isAdmin) return reply(mess.notadmin)
reply(`Gunakan dengan cara /setwelcome halo selamat datang @user
Placeholder yang tersedia

@user - mention user
@groupname - grub username`) 
break

case "\.setleave": 
case "setleave":
    case "setleft":
if(!isAdmin) return reply(mess.notadmin)
reply(`Gunakan dengan cara /setleave halo selamat datang @user
Placeholder yang tersedia

@user - mention user
@groupname - grub username`) 
break;

case "\.setproses": 
case "setproses":
if(!isAdmin) return reply(mess.notadmin)
reply(`Gunakan dengan cara .setproses Proses @user
Placeholder yang tersedia

@user - mention user
@tanggal - tanggal
@jam - Jam
@pesan - Pesanan`) 
break

case "\.setdone": 
case "setdone":
if(!isAdmin) return reply(mess.notadmin)
reply(`Gunakan dengan cara .setdone done @user
Placeholder yang tersedia

@user - mention user
@tanggal - tanggal
@jam - Jam
@pesan - Pesanan`) 
break

                
case "ping":
   reply(runtime(process.uptime()))
    break
    

                case "bot": 
                const { chatId: foundChatId, botName } = getBotInfo(msg.chat.id);

                if (foundChatId) {
                    reply(botName)
                } else {
                  reply(mess.default_bot)
                }
                function getBotInfo(chatId) {
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
                    const botInfo = existingData.find(entry => entry.chatId === chatId);
                
                    if (botInfo) {
                        return { chatId: botInfo.chatId, botName: botInfo.botName };
                    } else {
                        return { chatId: null, botName: null };
                    }
                }
                break

            default:
                break;
        }
    });
};
