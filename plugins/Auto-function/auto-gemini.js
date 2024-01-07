import {
    fetch
} from 'undici';

export async function before(m) {
    try {
        if (m.isBaileys && m.fromMe) return true;
        if (!m.isGroup || !m.msg || !m.message || m.key.remoteJid !== m.chat || global.db.data.users[m.sender].banned || global.db.data.chats[m.chat].isBanned) return false;

        const {
            users,
            chats
        } = global.db.data;
        const {
            text,
            quoted
        } = m;

        if (m.mtype === 'protocolMessage' || m.mtype === 'pollUpdateMessage' || m.mtype === 'reactionMessage' || m.mtype === 'stickerMessage') return;
        if (!quoted || !quoted.isBaileys || !chats[m.chat].gemini) return true;

        const msg = encodeURIComponent(text);
        console.log(msg);

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: msg
                    }]
                }]
            }),
        });

        const {
            candidates
        } = await response.json();
        if (candidates && candidates.length > 0) {
            const content = candidates[0].content;
            const reply = content.parts[0].text;

            if (reply) m.reply(reply);
        } else {
            m.reply("No suitable response from the API.");
        }
    } catch (error) {
        console.error(error);
    }
}