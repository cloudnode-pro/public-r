/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
const LanguageModule = class {
    constructor(gitServer) {
        this.node = typeof process === "object";
        const fetch = this.node ? require("node-fetch") : window.fetch;
        // https://stackoverflow.com/a/67565182/7089726
        this.replaceTemplates = this.translate = function (str, templates) {
            const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            for (const [template, replacement] of Object.entries(templates)) {
                const re = new RegExp('^' + escapeRegExp(template).replace(/%s/g, '(.*?)') + '$')
                if (re.test(str)) {
                    let i = 1;
                    const reReplacement = replacement
                        .replace(/\$/g, '$$$$')
                        .replace(/%s/g, () => '$' + i++)
                        return str.replace(re, reReplacement)
                }
            }
            lang.data.fallback[str] = str;
            return str
        };
        this.init = async function (lang) {
            const promise = new Promise((resolve, reject) => {
                if ((this.node && typeof this.data !== "object") || (!this.node && sessionStorage["languages.json"] === undefined)) {
                    fetch(`https://${gitServer}/translations/languages.json`).then(response => {
                        if (response.status !== 200) reject(response);
                        else response.json().then(languages => {
                            if (!this.node) fetch(`https://${gitServer}/translations/translations/${lang}.json`).then(f => f.json().then(data => {
                                const translations = data.content;
                                this.data = {languages, translations};
                                sessionStorage.setItem("languages.json", JSON.stringify(languages));
                                sessionStorage.setItem("languages.translations", JSON.stringify(translations));
                                resolve(this.data);
                            }));
                            else {
                                this.data = {languages};
                                this.translations = {};
                                function loop (i, keys, done) {
                                    if (i === keys.length) return done();
                                    const language = keys[language];
                                    fetch(`https://${gitServer}/translations/translations/${language}.json`).then(f => f.status !== 200 ? reject(f) : f.json().then(data => {
                                        const translations = data.content;
                                        this.data.translations[language] = data;
                                        loop(++i, keys, done);
                                    }));
                                }
                                loop(0, Object.keys(languages), () => resolve(this.data));
                            }
                        })
                    });
                }
                else {
                    if (!this.node) this.data = {
                        languages: JSON.parse(sessionStorage["languages.json"]),
                        translations: JSON.parse(sessionStorage["languages.translations"])
                    }
                    resolve(this.data)
                };
            });
            return promise;
        }
    }
}