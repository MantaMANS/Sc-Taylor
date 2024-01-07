const {
    BingImageCreator
} = await (await import('../../lib/ai/bing-image.js'));

const handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    let text;

    if (args.length >= 1) {
        text = args.join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else {
        throw 'Input teks atau reply teks!';
    }

    await m.reply(wait);

    try {
        const res = new BingImageCreator({
            cookie: "1CBrGSpML0Fz8WQSDRzqWaeyL9zle6nYrZn6uCwVyEEO8Nqdcs4B2UGs-zBkYVeTjYmvveLcSvkWvDtPHVV8CtUt0l15dzoSU_ARtKpYzDes8WjEKQPjWX64ckraHm676gEcRMa2dVE_nGuCLpFvnkDBdzkO_Kfesi4LgVMDrucBRmOPrSOVYzqPJVFXtNIOLDlW5xOUUi3rS8ltxZfSoCQ"
        });
        const data = await res.createImage(text);

        const filteredData = data.filter(file => !file.endsWith('.svg'));
        const totalCount = filteredData.length;

        if (totalCount > 0) {
            for (let i = 0; i < totalCount; i++) {
                try {
                    await conn.sendFile(
                        m.chat,
                        filteredData[i],
                        '',
                        `Image *(${i + 1}/${totalCount})*`,
                        m,
                        false, {
                            mentions: [m.sender],
                        }
                    );
                } catch (error) {
                    console.error(`Error sending file: ${error.message}`);
                    await m.reply(`Failed to send image *(${i + 1}/${totalCount})*`);
                }
            }
        } else {
            await m.reply('No images found after filtering.');
        }
    } catch (error) {
        console.error(`Error in handler: ${error.message}`);
        await m.reply('An error occurred while processing the request.');
    }
};

handler.help = ["bingimg *[query]*"];
handler.tags = ["ai"];
handler.command = /^(bingimg)$/i;
export default handler;