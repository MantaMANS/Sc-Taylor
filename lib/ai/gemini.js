import {
    fetch
} from 'undici';

class Gemini {
    constructor(apiKey = 'AIzaSyDJC5a882ruaC4XL6ejY1yhgRkN-JNQKg8') {
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.apiKey = apiKey;
    }

    async models() {
        return await this.request('models', 'GET');
    }

    async embedding(text) {
        return await this.request(
            'embedding-001:embedContent',
            'POST', {
                content: {
                    parts: [{
                        text
                    }]
                }
            }, {
                model: 'models/embedding-001'
            }
        );
    }

    async geminiPro() {
        return await this.request('gemini-pro', 'GET');
    }

    async generateGeminiProContent(text) {
        return await this.request(
            'gemini-pro:generateContent',
            'POST', {
                contents: [{
                    parts: [{
                        text
                    }]
                }]
            }
        );
    }

    async streamGenerateGeminiProContent(text) {
        return await this.request(
            'gemini-pro:streamGenerateContent',
            'POST', {
                contents: [{
                    parts: [{
                        text
                    }]
                }]
            }
        );
    }

    async generateGeminiProVisionContent(text, data, mime) {
        return await this.request(
            'gemini-pro-vision:generateContent',
            'POST', {
                contents: [{
                    parts: [{
                        text
                    }, {
                        inline_data: {
                            mime_type: mime,
                            data
                        }
                    }]
                }]
            }, {
                key: this.apiKey
            }
        );
    }

    async generateSweetPoemForKid(text) {
        return await this.generateGeminiProContent(text);
    }

    async countTokensGeminiPro(text) {
        return await this.request(
            'gemini-pro:countTokens',
            'POST', {
                contents: [{
                    parts: [{
                        text
                    }]
                }]
            }, {
                key: this.apiKey
            }
        );
    }

    async geminiProVision() {
        return await this.request('gemini-pro-vision', 'GET', null, {
            key: this.apiKey
        });
    }

    async request(endpoint, method, data, params) {
        try {
            const url = new URL(`${this.baseURL}/${endpoint}`);
            if (params) url.search = new URLSearchParams(params).toString();

            const headers = method === 'POST' ? {
                'Content-Type': 'application/json'
            } : {
                key: this.apiKey
            };

            const response = await fetch(url.toString(), {
                method,
                headers,
                body: method === 'POST' ? JSON.stringify(data) : undefined,
            });

            if (response.status === 403) {
                const errorResponse = await response.json();
                if (errorResponse.error && errorResponse.error.status === 'PERMISSION_DENIED') {
                    throw new Error("Permission denied. Please use a valid API Key or other form of API consumer identity to call this API.");
                }
            }

            return await response.json();
        } catch (error) {
            console.log(error);
            return {
                error: 'Failed to fetch data'
            };
        }
    }
}

export {
    Gemini
};