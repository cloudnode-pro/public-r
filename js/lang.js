/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
main.langModuleLoadCallbacks = [function () {main.langModuleLoaded = !0}];
main.langModuleLoaded = false;

// https://stackoverflow.com/a/67565182/7089726
function replaceTemplates (str, templates = main.langData.translations) {
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
    return str
}

if (sessionStorage["languages.json"] === undefined || sessionStorage["languages.translations"] === undefined) $.get({
    url: `https://${main.endpoints.git}/translations/languages.json`,
    success: function (response) {
        response = response.content;
        main.langData = {
        	languages: response
        }
        sessionStorage.setItem("languages.json", JSON.stringify(response));

        if (main.langData.languages[navigator.language.substr(0,2)] && main.cookies.lang === undefined) main.lang = navigator.language.substr(0,2);
        else if (main.langData.languages[main.cookies.lang]) main.lang = main.cookies.lang;

        $.get({
            url: `https://${main.endpoints.git}/translations/translations/${main.lang}.json`,
            success: function (response) {
                response = response.content;
                main.langData.translations = response;
                sessionStorage.setItem("languages.translations", JSON.stringify(response))

                main.langData.translate = replaceTemplates;

                for (let cb of main.langModuleLoadCallbacks) cb();
            }
        })
    }
});
else {
    main.langData = {
        languages: JSON.parse(sessionStorage["languages.json"]),
        translations: JSON.parse(sessionStorage["languages.translations"])
    }

    if (main.langData.languages[navigator.language.substr(0,2)] && main.cookies.lang === undefined) main.lang = navigator.language.substr(0,2);
    else if (main.langData.languages[main.cookies.lang]) main.lang = main.cookies.lang;

    for (let cb of main.langModuleLoadCallbacks) cb();
    main.langData.translate = replaceTemplates;
}