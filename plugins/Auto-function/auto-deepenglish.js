import axios from 'axios';

export async function before(m) {
    this.deepenglish = this.deepenglish || {};
    const chat = global.db.data.chats[m.chat];
    if (m.isBaileys || !m.text) return false;
    let text = m.text;
    try {
        if (chat.deepenglish) {
            const itsFirst = this.deepenglish[m.chat] || {
                first: true
            };
            if (itsFirst) {
                if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text) return true;

                this.deepenglish = this.deepenglish || {};
                if (!this.deepenglish[m.chat] || m.quoted.id != this.deepenglish[m.chat].msg.key.id) return;

                let txt = (m.msg && m.msg.selectedDisplayText ? m.msg.selectedDisplayText : m.text ? m.text : '');
                const openAIResponse = await Deepenglish(txt)
                const result = openAIResponse;

                if (result) {

                    let soal = await this.sendMessage(m.chat, {
                        text: result,
                        mentions: [m.sender]
                    }, {
                        quoted: m
                    });
                    this.deepenglish[m.chat].msg = soal;

                    if (this.deepenglish[m.chat].first = false) {
                        await this.sendMessage(m.chat, {
                            delete: this.deepenglish[m.chat].msg.key.id
                        });
                    }
                    this.deepenglish[m.chat].first = false;
                }
            }
        }
    } catch {
        //await this.reply(m.chat, 'Error occurred.', m);
    }
}

export const disabled = false;


async function Deepenglish(q) {
    try {
        const BinjieBaseURL = "https://api.binjie.fun/api/generateStream";
        const response = await axios.post(BinjieBaseURL, {
            prompt: q,
            system: "Hello!",
            withoutContext: true,
            stream: false
        }, {
            headers: {
                origin: "https://chat.jinshutuan.com",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36"
            }
        });
        return response.data;
    } catch (err) {
        console.log(err.response.data);
        return err.response.data.message;
    }
}