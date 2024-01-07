import axios from "axios";
import cheerio from "cheerio";

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw "Input Teks"
    await m.reply(wait)
    try {
        let result = await generate(text)
        await m.reply(result.reply)
    } catch (e) {
        await m.reply(eror)
    }
}
handler.help = ["gpt4free"]
handler.tags = ["gpt"];
handler.command = /^(gpt4free)$/i
export default handler

/* New Line */
async function generate(q) {
    try {
        const response = await axios.get("https://gpt4free.io/chat");
        const htmlData = response.data;

        const $ = cheerio.load(htmlData);
        const restNonce = JSON.parse($('.mwai-chatbot-container').attr('data-system')).restNonce;

        const submitResponse = await axios.post("https://gpt4free.io/wp-json/mwai-ui/v1/chats/submit", {
            botId: "default",
            newMessage: "hy",
            stream: false,
        }, {
            headers: {
                "X-WP-Nonce": restNonce,
                "Content-Type": "application/json",
            },
        });

        return submitResponse.data;
    } catch (err) {
        console.log(err.response.data);
        return err.response.data.message;
    }
}