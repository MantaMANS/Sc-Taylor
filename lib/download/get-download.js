import fetch from 'node-fetch';
import cheerio from 'cheerio';
import axios from 'axios';

function get(url, token) {
    return new Promise(async (resolve, reject) => {
        if (url.startsWith("https://vm.tiktok.com/") || url.startsWith("https://www.tiktok.com/") || url.startsWith("https://m.tiktok.com/v/")) {
            axios.get('https://tikwm.com/api/?url=' + url)
                .then((resp) => {
                    const result = {
                        tiktok: resp.data.data.play
                    }
                    resolve(result);
                })
        } else if (url.startsWith("https://www.facebook.com/")) {
            try {
                const vid = url.match(/\/(?:videos|reel|watch|story\.php).*?(?:\/|\?v=|story_fbid=)(\d+)/)?.[1];
                const response = await fetch(`https://graph.facebook.com/v8.0/${vid}?fields=source&access_token=${token}`);
                const data = await response.json();
                if (data.source === undefined) {
                    try {
                        const response = await fetch('https://www.facebook.com/api/graphql/', {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams({
                                doc_id: '5279476072161634',
                                variables: JSON.stringify({
                                    UFI2CommentsProvider_commentsKey: 'CometTahoeSidePaneQuery',
                                    caller: 'CHANNEL_VIEW_FROM_PAGE_TIMELINE',
                                    displayCommentsContextEnableComment: null,
                                    displayCommentsContextIsAdPreview: null,
                                    displayCommentsContextIsAggregatedShare: null,
                                    displayCommentsContextIsStorySet: null,
                                    displayCommentsFeedbackContext: null,
                                    feedbackSource: 41,
                                    feedLocation: 'TAHOE',
                                    focusCommentID: null,
                                    privacySelectorRenderLocation: 'COMET_STREAM',
                                    renderLocation: 'video_channel',
                                    scale: 1,
                                    streamChainingSection: false,
                                    useDefaultActor: false,
                                    videoChainingContext: null,
                                    videoID: vid,
                                }),
                                fb_dtsg: "",
                                server_timestamps: true,
                            }),
                        });
                        const data = await response.text();
                        const parsedData = JSON.parse(data.split('\n')[0]);
                        if (parsedData.data.video == null && url.indexOf('/permalink/') !== -1) {
                            fetch("https://fdownload.app/api/ajaxSearch", {
                                    "headers": {
                                        "accept": "*/*",
                                        "accept-language": "en,ar-DZ;q=0.9,ar;q=0.8",
                                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                                        "x-requested-with": "XMLHttpRequest",
                                        "Referer": "https://fdownload.app/en"
                                    },
                                    "body": `p=home&q=${encodeURIComponent(url)}`,
                                    "method": "POST"
                                })
                                .then(response => response.json())
                                .then(data => {
                                    var $1 = cheerio.load(data.data);
                                    var link = $1('.button.is-success.is-small.download-link-fb').attr('href');
                                    var time = $1('p').text();
                                    time = time.split(":");
                                    if (time[0] >= 5) {
                                        var e = 819
                                        reject(e)
                                    } else {
                                        const result = {
                                            facebook: link
                                        }
                                        resolve(result);
                                    }
                                }).catch(e => {
                                    reject({
                                        status: false,
                                        message: 'error fetch data',
                                        e: e.message
                                    })
                                });
                        } else {
                            const videoUrl =
                                parsedData.data.video.playable_url_quality_hd ||
                                parsedData.data.video.playable_url;
                            const result = {
                                facebook: videoUrl
                            }
                            resolve(result);
                        }
                    } catch (error) {
                        reject({
                            status: false,
                            message: 'error fetch data',
                            e: error.message
                        })
                    }
                } else {
                    const result = {
                        facebook: data.source
                    }
                    resolve(result);
                }
            } catch (error) {
                reject({
                    status: false,
                    message: 'error fetch data',
                    e: error.message
                })
            }
        } else if (url.startsWith("https://l.facebook.com/") || url.startsWith("https://fb.watch/")) {
            if (url.startsWith("https://l.facebook.com/")) {
                const uValue = url.match(/u=([^&]+)/)[1];
                const decodedValue = decodeURIComponent(uValue);
                resolve(get(decodedValue, token));
            } else {
                axios.get(url, {
                        maxRedirects: 1
                    })
                    .then(response => {
                        const regex = /<([^>]+)>/;
                        const matches = regex.exec(response.headers.link);
                        const url = matches[1];
                        resolve(get(url, token));
                    })
                    .catch(error => {
                        console.error('An error occurred:', error);
                    });
            }
        } else if (url.startsWith("https://www.instagram.com/p/") || url.startsWith("https://www.instagram.com/tv/") || url.startsWith("https://www.instagram.com/reel/") || url.startsWith("https://www.instagram.com/reels/")) {
            axios.post("https://insta.savetube.me/downloadPostVideo", {
                    url: url
                }, {
                    headers: {
                        "Referer": "https://insta.savetube.me/reels-download",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    }
                })
                .then(response => {
                    const result = {
                        instavid: response.data.post_video_url
                    }
                    resolve(result)
                })
                .catch(error => {
                    if (error.response.status == 500) {
                        reject(1315);
                    } else {
                        reject({
                            status: false,
                            message: 'error fetch data'
                        })
                    }
                });
        } else if (url.startsWith("https://www.instagram.com/stories/") || url.startsWith("https://instagram.com/stories/")) {
            fetch("https://ssyoutube.com/api/ig/story?url=" + encodeURIComponent(url), {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "en,ar-DZ;q=0.9,ar;q=0.8",
                        "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                        "cookie": "_ga=GA1.2.1105512461.1669141912; uid=7dd280a92bfd4314; push=29; outputStats=37; clickAds=38; _gid=GA1.2.640126404.1676296979; laravel_session=eyJpdiI6IjRHMU1xamtYR3R6Q0k1azJOQ1psRVE9PSIsInZhbHVlIjoiMjNkRkpxS3lxaEFwWmlRL0pIbC8vMWRIczBuM2tWb1ZRb0twcmlzLzQzMW5Yek5RVmpGZFZyMGFuMWhoWWtaVWc2MFFEdVpOT1NCOVNMa1pEeUp6S3VjN093a2IwMFROY1V3cUw1YWRyS0YrKzN0YjVINjJrNjFWV2o3YmcvWjQiLCJtYWMiOiJkZmY5MDJjNGNjN2JhNTZlNmRiM2IzODg4ZGFlM2RjMWY4ZTYyMjI0YjZiYjUwODA0OTdhN2NhZmVjNWEwOThlIiwidGFnIjoiIn0%3D; _gat_outputStats=1",
                        "Referer": "https://ssyoutube.com/en467/",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": null,
                    "method": "GET"
                })
                .then(response => response.json())
                .then(data => {
                    if (data.result[0].video_versions) {
                        const result = {
                            instavid: data.result[0].video_versions[0].url
                        }
                        resolve(result);
                    } else {
                        const result = {
                            instimage: data.result[0].image_versions2.candidates[0].url
                        }
                        resolve(result);
                    }
                }).catch(e => {
                    reject({
                        status: false,
                        message: 'error fetch data',
                        e: e.message
                    })
                });
        } else if (url.startsWith("@")) {
            let uid = url.split("@");
            fetch("https://igdownloader.com/ajax", {
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "x-requested-with": "XMLHttpRequest",
                        "Referer": "https://igdownloader.com/reels-downloader"
                    },
                    "body": `link=https://www.instagram.com/${uid[1]}&downloader=avatar`,
                    "method": "POST"
                })
                .then(response => response.json())
                .then(data => {
                    var $1 = cheerio.load(data.html);
                    var link = $1('.download-button').attr('href');
                    const result = {
                        instavatar: link
                    }
                    resolve(result);
                }).catch(e => {
                    reject({
                        status: false,
                        message: 'error fetch data',
                        e: e.message
                    })
                });
        } else if (url.startsWith("https://youtube.com/") || url.startsWith("https://www.youtube.com/") || url.startsWith("https://youtu.be/")) {
            const vid = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/)?(?:watch\?v=)?|youtu\.be\/)([^?/]+)/)[1]
            axios.post("https://api.ytbvideoly.com/api/thirdvideo/parse",
                    `link=${encodeURIComponent(url)}&from=videodownloaded`, {
                        headers: {
                            "accept": "*/*",
                            "accept-language": "en,ar-DZ;q=0.9,ar;q=0.8",
                            "content-type": "application/x-www-form-urlencoded",
                            "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site"
                        },
                        referrerPolicy: "no-referrer"
                    })
                .then(response => {
                    const formattedTime = `${Math.floor(response.data.data.duration / 60)}:${(response.data.data.duration % 60 < 10 ? "0" : "") + (response.data.data.duration % 60)}`;
                    const result = {
                        shorts: [{
                            cover: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
                            id: vid,
                            name: response.data.data.title,
                            duration: formattedTime,
                            vid: response.data.data.videos.mp4[0].url,
                            audio: response.data.data.audios.m4a[0].url
                        }]
                    }
                    resolve(result);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    })
}
export {
    get
};