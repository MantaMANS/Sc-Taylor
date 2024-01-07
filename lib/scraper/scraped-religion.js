import axios from "axios";
import cheerio from "cheerio";
import {
    fileURLToPath
} from 'url';
import chalk from 'chalk';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

async function listsurah() {
    return new Promise((resolve, reject) => {
        axios
            .get("https://litequran.net/")
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                let surahList = [];

                $("body > main > section > ol > li > a").each(function(_, element) {
                    surahList.push($(element).text());
                });

                const result = {
                    status: true,
                    listsurah: surahList
                };
                resolve(result);
            })
            .catch(reject);
    });
}

async function surah(surahNumber) {
    return new Promise((resolve, reject) => {
        axios
            .get(`https://litequran.net/${surahNumber}`)
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                let verses = [];

                $("body > main > article > ol > li").each(function(_, element) {
                    const verse = {
                        status: true,
                        arab: $(element).find("> span.ayat").text(),
                        latin: $(element).find("> span.bacaan").text(),
                        translate: $(element).find("> span.arti").text(),
                    };
                    verses.push(verse);
                });

                resolve(verses);
            })
            .catch(reject);
    });
}

async function tafsirsurah(surahNumber) {
    return new Promise((resolve, reject) => {
        axios
            .get(`https://tafsirq.com/topik/${surahNumber}`)
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                let tafsirList = [];

                $("body > div:nth-child(4) > div > div.col-md-6 > div ").each(function(_, element) {
                    const tafsir = {
                        status: true,
                        surah: $(element).find("> div.panel-heading.panel-choco > div > div > a").text(),
                        tafsir: $(element).find("> div.panel-body.excerpt").text().trim(),
                        type: $(element).find("> div.panel-heading.panel-choco > div > div > span").text(),
                        source: $(element).find("> div.panel-heading.panel-choco > div > div > a").attr("href"),
                    };
                    tafsirList.push(tafsir);
                });

                resolve(tafsirList);
            })
            .catch(reject);
    });
}

export {
    listsurah,
    surah,
    tafsirsurah
};

let file = fileURLToPath(import.meta.url);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.bgGreen(chalk.black("[  UPDATE ]")), chalk.white(`${__filename}`));
    import(`${file}?update=${Date.now()}`);
});