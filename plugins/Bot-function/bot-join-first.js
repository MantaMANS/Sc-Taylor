import emojiRegex from 'emoji-regex';

export async function before(m) {
    if (m.isBaileys || !m.sender || !m.text || !this.chats) return;
    const symbolRegex = /^[^\w\s\d]/u;
    const emojiAndSymbolRegex = new RegExp(`(${symbolRegex.source}|${emojiRegex().source})`, 'u');
    const prefixRegex = new RegExp(`^${emojiAndSymbolRegex.source}`, 'u');
    if (!prefixRegex.test(m.text)) return;
    const groupCode = global.sgc.split('/').pop();
    let groupId;

    try {
        groupId = (await this.groupGetInviteInfo(groupCode)).id;
    } catch (error) {
        groupId = "120363047752200594@g.us";
    }

    let data;
    try {
        data = (await this.groupMetadata(groupId));
    } catch (error) {
        try {
            data = (await this.chats[groupId].metadata);
        } catch (error) {
            data = null;
        }
    }

    if (!data) return this.reply(m.chat, "Error fetching group information:\nAdd me in group: " + global.sgc, m);
    const isIdExist = data.participants.some(participant => participant.id === m.sender);
    global.db.data.chats[m.chat].isBanned = !isIdExist;
    if (!isIdExist) {
        const urls = "https://chat.whatsapp.com/";
        const inviteCode = await this.groupInviteCode(groupId);
        const caption = `🤖 Please join the bot's group first to use its services.\n\nJoin here: ${urls + inviteCode || groupCode}`;
        await this.reply(m.chat, caption, m);
    }
}
export const disabled = false;