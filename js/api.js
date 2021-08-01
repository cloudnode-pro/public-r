/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
if (typeof main !== "object") throw new Error("Main module is required");
if (localStorage.main.apiData !== undefined) main.apiData = JSON.parse(localStorage.main.apiData);
if (typeof main.apiData !== "object" || main.apiData.time + main.apiData.branches.ttl * 1000 < Date.now()) fetch(`https://${main.endpoints.api}/`).then(f => {
    f.json().then(data => {
        main.apiData = data;
        localStorage.setItem("main.apiData", JSON.stringify(main.apiData));
    });
});

main.api = {
    auth: {
        register: function (name, email, password, bypass, callback = new Function) {
            let data = {};
            if (typeof name === "string") data.name = name;
            if (typeof email === "string") data.email = email;
            if (typeof password === "string") data.password = password;
            if (typeof bypass === "string") data.bypass = password;
            $.post({
                url: `https://${main.endpoints.api}/auth/register`,
                data: data,
                success: function () {
                    callback(...arguments);
                    if (typeof arguments[0] === "object" && typeof arguments[0].errors === "undefined" && typeof arguments[0].token === "string")
                        main.api.session(arguments[0].token, function (data) {
                            main.session = data;
                            main.session.token = r.token;
                            localStorage.setItem("__session", JSON.stringify(data));
                        })
                },
                credentials: true
            });
        },
        login: function (email, password, mfa, callback = new Function) {
            if (typeof mfa === "function") callback = mfa;
            let data = {};
            if (typeof email === "string") data.email = email;
            if (typeof password === "string") data.password = password;
            if (typeof mfa !== "undefined") data["2fa"] = mfa;
            $.post({
                url: `https://${main.endpoints.api}/auth/login`,
                data: data,
                success: function (r, x) {
                    callback(r, x);
                    if (typeof r === "object" && typeof r.errors === "undefined" && typeof r.token === "string")
                        main.api.session(r.token, function (data) {
                            main.session = data;
                            main.session.token = r.token;
                            localStorage.setItem("__session", JSON.stringify(data));
                        })
                },
                credentials: true
            });
        },
        oauth: {
            google: function () {},
            github: function () {},
            discord: function () {}
        },
        logout: function (callback = new Function) {
            $.post({
                url: `https://${main.endpoints.api}/auth/logout`,
                success: callback,
                credentials: true
            });
            localStorage.removeItem("__session");
            main.session = {};
        }
    },
    session: function (token = "", callback = new Function) {
        if (typeof token === "function") {
            callback = token;
            token = "";
        }
        else if (token.length > 0) token = `/${encodeURIComponent(token)}`;
        $.get({
            url: `https://${main.endpoints.api}/session${token}`,
            success: callback,
            credentials: true
        })
    },
    currency: function (input = "", callback = new Function) {
        if (typeof input === "function") {
            callback = input;
            input = "";
        }
        else if (input.length > 0) input = `/${input}`;
        $.get({
            url: `https://${main.endpoints.api}/currency${input}`,
            success: callback,
            credentials: true
        })
    },
    account: {
        details: function () {},
        email: {
            confirm: function (code, callback = new Function) {
                $.post({
                    url: `https://${main.endpoints.api}/account/email/confirm`,
                    data: {
                         token: code   
                    },
                    success: callback,
                    credentials: true
                })
            }
        },
        password: function () {},
        reset: function () {}
    },
    validate: {
        email: function (input, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/validate/email?input=${encodeURIComponent(input)}`,
                success: callback
            })
        },
        name: function (input, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/validate/name?input=${encodeURIComponent(input)}`,
                success: callback
            })
        },
        password: function (input, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/validate/password?input=${encodeURIComponent(input)}`,
                success: callback
            })
        }
    },
    verify: {
        email: function (input, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/verify/email?input=${encodeURIComponent(input)}`,
                success: callback
            })
        },
        network: function (input, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/verify/network?input=${encodeURIComponent(input)}`,
                success: callback
            })
        },
        hostname: function (input, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/verify/hostname?input=${encodeURIComponent(input)}`,
                success: callback
            })
        }
    },
    service: function (id) {
        return {
            billing: function () {}
        }
    },
    domain: {
        search: function (domain, callback = new Function) {
            $.get({
                url: `https://${main.endpoints.api}/domain/search/${domain}`,
                success: function (response, xhr) {
                    return callback(response, xhr);
                }
            })
        }
    },
    users: {
        user: {
            basic: function (user, bypass, callback = new Function) {
                $.get({
                    url: `https://${main.endpoints.api}/users/${user}/basic${bypass === undefined ? "" : `?bypass=${bypass}`}`,
                    success: function (response, xhr) {
                        return callback(response, xhr);
                    }
                })
            }
        }
    },
    pricing: function (q, callback = new Function) {
        let suffix = "";
        if (typeof q === "string" || typeof q === "number") suffix = `/${q}`;
        else if (typeof q === "function") callback = q;
        $.get({
            url: `https://${main.endpoints.api}/pricing${suffix}`,
            success: function (response, xhr) {
                return callback(response, xhr);
            }
        })
    },
    stats: function (q = "", callback = new Function) {
        $.get({
            url: `https://${main.endpoints.api}/stats/${q}`,
            success: callback
        })
    }
}