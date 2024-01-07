import {
    sticker
} from '../../lib/sticker.js';
import axios from 'axios';

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    let reply;

    try {
        if (text && m.quoted) {
            if (m.quoted.text || m.quoted.sender) {
                reply = {
                    "name": await conn.getName(m.quoted.sender),
                    "text": m.quoted.text || '',
                    "chatId": m.chat.split('@')[0],
                };
            }
        } else if (text && !m.quoted) {
            reply = {};
        } else if (!text && m.quoted) {
            if (m.quoted.text) {
                text = m.quoted.text || '';
            }
            reply = {};
        } else {
            throw "Input teks atau reply teks yang ingin dijadikan quote!";
        }

        await m.reply(wait);

        let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/a2ae6cbfa40f6eeea0cf1.jpg');

        const obj = {
            "type": "quote",
            "format": "png",
            "backgroundColor": getRandomHexColor().toString(),
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [{
                "entities": [],
                "avatar": true,
                "from": {
                    "chatId": m.chat.split('@')[0],
                    "name": m.name,
                    "photo": {
                        "url": pp
                    }
                },
                "text": text,
                "replyMessage": reply
            }]
        };

        const buffer = await Quotly(obj);
        let stiker = await sticker(buffer, false, global.packname, global.author);
        if (stiker) return conn.sendFile(m.chat, stiker, 'Quotly.webp', '', m);
    } catch (error) {
        console.error(error);
        return m.reply("Terjadi kesalahan dalam menjalankan perintah.");
    }
};

handler.help = ['qc'];
handler.tags = ['sticker'];
handler.command = /^(qc)$/i;
export default handler;

async function Quotly(obj) {
    let json;

    try {
        json = await axios.post("https://quote-api.rippanteq7.repl.co/generate", obj, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        try {
            json = await axios.post("https://quote-api-1.jigarvarma2005.repl.co/generate", obj, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } catch (e) {
            try {
                json = await axios.post("https://qc-api.rizzlogy.repl.co/generate", obj, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } catch (e) {
                try {
                    json = await axios.post("https://quote-api.ghost19ui.repl.co/generate", obj, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                } catch (e) {
                    return e;
                }
            }
        }
    }

    const results = json.data.result.image;
    const buffer = Buffer.from(results, "base64");
    return buffer;
}

function getRandomHexColor() {
    const randomColor = () => Math.floor(Math.random() * 200).toString(16).padStart(2, "0");
    return `#${randomColor()}${randomColor()}${randomColor()}`;
}