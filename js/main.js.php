/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
"use strict";
if (typeof Intl === "undefined" || typeof window.Promise === "undefined" || typeof window.fetch === "undefined" || typeof window.Symbol === "undefined") {
    document.body.innerHTML = '<div style="background-color:inherit;position:absolute;top:0;left:0;bottom:0;right:0;background-color:inherit;color:inherit;padding:2rem"><div style="max-width:800px;margin:0 auto;margin-top:7rem"><h1 style="font-weight:normal;font-family:monospace;opacity:.3">error</h1><p style="font-family:sans-serif;font-size:150%">The browser you are using does not support essential JavaScript functions that are required to run the platform.</p><p style="font-family:sans-serif;opacity:.8">In order for our platform to function, try accessing it from a more modern or up-to-date browser.</p></div></div>';
    throw new Error("Unsupported browser.");
}
const main = {
    company: {
        name: "<?= $mcfg->platform->name ?>",
        legalName: "<?= $mcfg->platform->legalName ?>",
        domain: "<?= $mcfg->platform->domain ?>"
    },
    endpoints: {
        api: "<?= $mcfg->platform->endpoints->api ?>",
        git: "<?= $mcfg->platform->endpoints->git ?>"
    },
    lang: "en",
    api: {
        error: "SDK not implemented."
    },
    __meta: {
        time: new Date(<?= time() ?>000),
        mcfg: <?= json_encode($mcfg->meta) ?>
    },
    session: localStorage.__session?.startsWith('{') ? JSON.parse(localStorage.__session) : {},
    cookies: {},
    sitemap: {
        fetch: function (a, b) {
            let force = false,
                callback = new Function;

            "boolean" == typeof a ? force = a : "boolean" == typeof b && (force = a);
            "function" == typeof a ? callback = a : "function" == typeof b && (callback = a);


            if (force || (main.sitemap.cache && Object.keys(main.sitemap.cache).length === 0 && main.sitemap.cache.constructor === Object)) $.get({
                url: "/r/sitemap.json",
                success: function (response) {
                    main.sitemap.cache = response;
                    callback(main.sitemap.cache)
                }
            })
            else callback(main.sitemap.cache)
        },
        cache: {}
    },
    page: {
        __meta: {
            get: <?= json_encode($_GET) ?>,
            post: <?= json_encode($_POST) ?>
        },
        url: function () {
            return (location.pathname !== "/" ? location.pathname.replace(/\/$/g, "") : location.pathname).match(/((?<=\/*)[^\/]+)|^\/$/g)
        },
        rootname: function () {
            return (location.pathname !== "/" ? location.pathname.replace(/\/$/g, "") : location.pathname).match(/((?<=\/*)[^\/]+)|^\/$/g).pop()
        },
        basename: function () {
            return (location.pathname !== "/" ? location.pathname.replace(/\/$/g, "") : location.pathname).split("/").pop()
        },
        pathname: function () {
            return location.pathname !== "/" ? location.pathname.replace(/\/$/g, "") : location.pathname
        },
        loadScript: function(t = [], e = new Function) {
            if (!(t instanceof Array)) t = [t];
            function loadScripts (t, i = 0) {
                if (i < t.length) main.ajax.send({
                    url: t[i],
                    success: function (response) {
                        try {
                            eval(response)
                        }
                        catch (err) {
                            console.error(err);
                        }
                        main.page.loadedScripts.push(t[i])
                        loadScripts(t, ++i);
                    }
                })
                else {
                    $(document)[0].dispatchEvent(new CustomEvent('main.page.scriptLoaded', {bubbles: true, detail:{scripts: t}}))
                    return e();
                }
            }
            loadScripts(t);
        },
        loadScriptOnce: function (s, c = new Function) {
            if (main.page.loadedScripts.indexOf(s) > -1) return c();
            else return main.page.loadScript(s, c);
        },
        fetchAsync: async function (path) {
            return await (await fetch(path)).text()
        },
        loadedScripts: [],
        load: function (path = main.page.pathname()) {
            main.page.printed = false;
            main.sitemap.fetch(function (sitemap) {
                let page = sitemap[Object.keys(sitemap).find(function (a) {
                    let aMap = a.split("/").splice(1),
                        pathMap = path.split("/").splice(1);
                    for (let i in aMap) if (aMap[i] === pathMap[i] || aMap[i] === "*") pathMap[i] = aMap[i];
                    return aMap.join("/") === pathMap.join("/");
                })];
                if (page === undefined) page = sitemap["/errors/404"];
                main.page.print(page, renderLanguageSelector);
                function renderLanguageSelector () {
                    $(".language-select .dropdown-menu").html("");
                    for (let lang in main.langData.languages) {
                      let langData = main.langData.languages[lang];
                      $(".language-select .dropdown-menu").append(`<li><a class="dropdown-item" href="#" data-lang="${lang}"><img src="${langData.icon}" height="21" class="align-middle me-2"><span class="align-middle">${langData.name}</span></a></li>`);
                    }
                    $(".language-select .dropdown-menu .dropdown-item").click(function (e) {
                        e.preventDefault();
                        $(".language-select .dropdown-toggle").html($(this).html());
                        document.cookie = `lang=${$(this).attr("data-lang")};expires=${new Date(Date.now() + 9461e7).toUTCString()};path=/;domain=${location.hostname}`;
                        main.lang = $(this).attr("data-lang");
                        sessionStorage.removeItem("languages.json");
                        sessionStorage.removeItem("languages.translations");
                        location.reload(true);
                    });
                    $(".language-select .dropdown-toggle").html(`<img src="${main.langData.languages[main.lang].icon}" height="21" class="align-middle me-2"><span class="align-middle">${main.langData.languages[main.lang].name}</span>`);
                }
            })
        },
        print: function (page, callback = new Function) {
            document.title = page.title;
            let protocol = page.src.split(":")[0],
                data = page.src.substr(protocol.length + 1),
                matches = data.match(/{{[^}\n]*}}/g) || [];
            for (let placeholder of matches) data = data.replace(placeholder, eval(placeholder.substr(2, placeholder.length - 4)));
            switch (protocol) {
                case "cmp": {
                    main.cmp.fetch(data, function (response) {
                        $("html").html(response);
                        $("script").each(function (i, k) {
                            try {new Function($(k).html())()}
                            catch (err) {console.error(err)}
                            $(k).remove();
                        });
                        callback();
                        $(document)[0].dispatchEvent(new CustomEvent('main.page.print', {bubbles: true, detail: page}))
                        document.title = page.title;
                        if (sessionStorage.scrollPage === location.pathname && location.hash === "") window.scroll(0, sessionStorage.scrollY);
                        else (window.scroll(0, 0));
                        main.page.loadScript("/r/js/pagepop.js")
                        if ($("html [autofocus]").length > 0) $($("html [autofocus]")[0]).focus();
                        main.page.printed = true;
                        $(document)[0].dispatchEvent(new CustomEvent('main.page.printed', {bubbles: true, detail:{page: page}}));
                    });
                    break;
                }
                case "text": {
                    $("html").html(data);
                    if (sessionStorage.scrollPage === location.pathname) window.scroll(0, sessionStorage.scrollY);
                    main.page.loadScript("/r/js/pagepop.js")
                    if ($("html [autofocus]").length > 0) $($("html [autofocus]")[0]).focus()
                    callback();
                    break;
                }
                case "redir": {
                    //location.href = data;
                    main.page.loadScript("/r/js/pagepop.js", function () {
                        main.page.pop(data);
                    })
                    break;
                }
                case "load": {
                    main.page.load(data);
                    break;
                }
            }
        }
    },
    cmp: {
        cacheList: [],
        fetch: function (cmp, callback = new Function) {
            let doc = "";
            if (sessionStorage[`cmp/${cmp}`] !== undefined) success(sessionStorage[`cmp/${cmp}`]);
            else $.get({
                url: `/cmp/${cmp}.html`,
                success: success,
                error: function (err) {
                    console.error(err);
                }
            });
            function success (response) {
                doc = response;
                if (main.cmp.cacheList.indexOf(cmp) > -1) sessionStorage.setItem(`cmp/${cmp}`, doc);
                //eval js: placeholders
                let matches = doc.match(/{{js:.+?}}/g);
                matches = matches === null ? [] : matches;
                for (let match of matches) {
                    let code = match.substr(5, match.length - 7),
                        codeEval = null
                    try {
                        codeEval = eval(code);
                        codeEval === undefined ? codeEval = "" : codeEval;
                    }
                    catch (err) {
                        console.error(err)
                    }
                    doc = doc.replace(match, codeEval)
                }

                let translationsMatch = doc.match(/{{translate:[^}\n]*}}/g) || [];
                main.page.loadScriptOnce("/r/js/lang.js", function () {
                    if (!main.langModuleLoaded) main.langModuleLoadCallbacks.push(f);
                    else f();
                    function f () {
                        for (let placeholder of translationsMatch) doc = doc.replace(placeholder, main.langData.translate(placeholder.substr(placeholder.split(":")[0].length + 1, placeholder.length - placeholder.split(":")[0].length - 3)));

                        //include components in doc
                        matches = doc.match(/{{cmp:[A-z0-9/]+}}/g);
                        matches = matches === null ? [] : matches;
                        
                        function replaceMatches (matches, i = 0) {
                            if (i < matches.length) {
                                main.cmp.fetch(matches[i].substr(6, matches[i].length - 8), function (content) {
                                    doc = doc.replace(matches[i], content);
                                    replaceMatches(matches, ++i);
                                })
                            }
                            else callback(doc);
                        }
                        replaceMatches(matches);
                    }
                });
            }
        }
    },
    ajax: {
        send: function(t = {}) {
            "string" === typeof t.method ? t.method = t.method.toUpperCase() : t.method = "GET";
            "boolean" === typeof t.async ? t.async : t.async = true;
            "object" === typeof t.data ? t.data = new URLSearchParams(t.data).toString() : t.data = "";
            let e = new XMLHttpRequest;
            e.onload = function() {
                let e = this.responseText;
                "application/json" === this.getResponseHeader("content-type") && (e = JSON.parse(e));
                let s = this.getAllResponseHeaders().trim().split("\n");
                this.headers = {};
                for (let t in s) {
                    if (typeof s[t] === "string") {
                        let e = s[t].split(/:(.+)/)[1].trim();
                        e == +e && (e = +e), e === new Date(e).toUTCString() && (e = new Date(e)), this.headers[s[t].split(/:(.+)/)[0].trim()] = e
                    }
                }
                "function" == typeof t.load && t.load(e, this), "function" == typeof t.error && 200 !== this.status && 4 === this.readyState && t.error(this, this.status, this.statusText), "function" == typeof t.success && 4 === this.readyState && t.success(e, this)
            }, e.open(t.method, t.url, t.async), e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), t.credentials ? e.withCredentials = true : void(0), e.send(t.data);
            "object" === typeof t.headers ? (function () {
                for (let header in t.headers) e.setRequestHeader(header, t.headers[header]);
            }) : void(0);

            return e;
        },
        parseDirectives: function(t) {
            let e = {};
            t = t.split(";").map(t => t.trim());
            for (let s of t)
                if (s.includes("=")) {
                    let [t, n] = s.match(/=(.+)/);
                    e[t] = n
                }
                else e[s] = !0;
            return e
        },
		formData: function(obj) {
			let formData = new FormData();
			for (let key in obj) {
				let val = obj[key];
				if (typeof val === "object") for (let i in val) formData.append(`${key}[${i}]`, val[i]);
				else formData.append(key, val);
			}
			return formData;
		}
    }
};

//main.page.loadScript("/r/js/jtfd.js")
main.page.loadScript("/r/js/api.js")
main.page.loadScript("/r/js/utils.js")
main.page.loadScript("/r/js/init.js")

function QueryNodes () {
    this.length = 0;
    this.iterator = function (callback = new Function) {
        for (let i in this) if (this[i] instanceof HTMLElement || this[i] instanceof HTMLDocument || this[i] instanceof Window) callback(this[i], +i);
    }
    this.push = function (node) {
        this[this.length] = node;
        ++this.length;
        return this;
    }
};

function Query (selector) {
	let nodes = typeof selector === "string" ? document.querySelectorAll(selector) : selector;
    let QN = new QueryNodes();
    if (nodes && nodes.constructor.name === "NodeList") nodes.forEach(function (a, b) {
        QN[b] = a;
        ++QN.length;
    });
    else if (nodes instanceof HTMLElement || nodes instanceof HTMLDocument || nodes instanceof Window) {
        QN[0] = nodes;
        QN.length = 1;
    }

    nodes = QN;

	nodes.__proto__.html = function (html) {
		if ("undefined" === typeof html) return nodes[0].innerHTML;
		else nodes.iterator(function (node) {node.innerHTML = html})
		return nodes;
	}/*
    nodes.__proto__.append = function (html) {
        nodes.iterator(function (node) {
            node.innerHTML += html;
        })
        return nodes;
    }*/
    nodes.__proto__.append = function (html) {
        let d = document.createElement("DIV");
        d.innerHTML = html;
        nodes.iterator(function (node) {
            node.appendChild(d.firstChild);
        })
        return nodes;
    }
    nodes.__proto__.prepend = function (html) {
        nodes.iterator(function (node) {
            node.innerHTML = html + node.innerHTML;
        })
        return nodes;
    }
    nodes.__proto__.val = function (val) {
        if ("undefined" === typeof val) return nodes[0].value;
        else nodes.iterator(function (node) {
            node.value = val;
        })
        return nodes;
    }
	nodes.__proto__.text = function (text) {
		if ("undefined" === typeof text) return nodes[0].innerText;
		else nodes.iterator(function (node) {
            node.innerHTML = text;
        })
		return nodes;
	}
    nodes.__proto__.parent = function () {
        let qn = new QueryNodes().push(nodes[0].parentNode);
        nodes = qn;
        return qn;
    }
    nodes.__proto__.parents = function () {
        let QN = new QueryNodes(),
            a =  [...(function*(e){do { yield e; } while (e = e.parentNode);})(nodes[0])].slice(1).reverse().slice(1).reverse();
        for (let k of a) QN.push(k);
        return QN;
    }
    nodes.__proto__.remove = function () {
        nodes.iterator(function (node) {node.remove()});
        return nodes;
    }
    nodes.__proto__.css = function (a, b) {
        let argument = a,
            length = typeof a === "undefined" ? 0 : typeof b !== "undefined" ? 2 : 1;
        if (typeof argument === "string" && !argument.includes(":") && length === 1) return getComputedStyle(nodes[0])[argument];
        else nodes.iterator(function (node) {
            if (typeof argument === "string") {
                if (length === 1) node.style.setProperty(argument.match(/:(.+)/)[0].trim(), argument.match(/:(.+)/)[1].trim());
                else if (length > 1) node.style.setProperty(a, b);
            }
            else if (typeof argument === "object") for (let property in argument) node.style.setProperty(property, argument[property]);
        })
        return nodes;
    }

    nodes.__proto__.attr = function (a, b) {
        let argument = a,
            length = typeof a === "undefined" ? 0 : typeof b !== "undefined" ? 2 : 1;
        if (typeof argument === "string" && !argument.includes(":") && length === 1) return nodes[0].getAttribute(argument);
        else nodes.iterator(function (node) {
            if (typeof argument === "string") {
                if (length === 1) node.setAttribute(argument.match(/:(.+)/)[0].trim(), argument.match(/:(.+)/)[1].trim());
                else if (length > 1) node.setAttribute(a, b);
            }
            else if (typeof argument === "object") for (let property in argument) node.setAttribute(property, argument[property]);
        })
        return nodes;
    }
    nodes.__proto__.addClass = function (className) {
        nodes.iterator(function (node) {node.classList.add(className)});
        return nodes;
    }
    nodes.__proto__.removeClass = function (className) {
        nodes.iterator(function (node) {node.classList.remove(className)});
        return nodes;
    }
    nodes.__proto__.hasClass = function (className) {
        return nodes[0].classList.contains(className);
    }
    nodes.__proto__.toggleClass = function (className, state) {
        if (typeof state === "boolean") state ? nodes.addClass(className) : nodes.removeClass(className);
        else nodes.iterator(function (node) {node.classList.contains(className) ? node.classList.remove(className) : node.classList.add(className)});
        return nodes;
    }
    nodes.__proto__.hasAttr = function (attr) {
        return nodes[0].hasAttribute(attr);
    }
    nodes.__proto__.removeAttr = function (attr) {
        nodes.iterator(function (node) {node.removeAttribute(attr)});
        return nodes;
    }
    nodes.__proto__.find = function (s) {
        let elements = new QueryNodes();
        nodes.iterator(function (node, i) {
            let e = node.querySelectorAll(s);
            for (let k of e) elements.push(k);
        })
        nodes = elements;
        return elements;
    }
    nodes.__proto__.each = function (callback) {
        if (typeof callback !== "function") throw new Error("@callback must be a function");
        for (let i in nodes) if (nodes[i] instanceof HTMLElement) callback(i, nodes[i]);
        return nodes;
    }
    nodes.__proto__.blur = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("blur", callback)});
        else nodes[0].blur();
        return nodes;
    }
    nodes.__proto__.focus = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("focus", callback)});
        else nodes[0].focus();
        return nodes;
    }
    nodes.__proto__.submit = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("submit", callback)});
        else nodes[0].submit();
        return nodes;
    }
    nodes.__proto__.click = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("click", callback)});
        else nodes[0].click();
        return nodes;
    }
    nodes.__proto__.keydown = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("keydown", callback)});
        else nodes[0].keydown();
        return nodes;
    }
    nodes.__proto__.input = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("input", callback)});
        else nodes[0].input();
        return nodes;
    }
    nodes.__proto__.keypress = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("keypress", callback)});
        else nodes[0].keypress();
        return nodes;
    }
    nodes.__proto__.mousedown = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("mousedown", callback)});
        else nodes[0].mousedown();
        return nodes;
    }
    nodes.__proto__.mouseup = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("mouseup", callback)});
        else nodes[0].mouseup();
        return nodes;
    }
    nodes.__proto__.keyup = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("keyup", callback)});
        else nodes[0].keyup();
        return nodes;
    }
    nodes.__proto__.change = function (callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {node.addEventListener("change", callback)});
        else nodes[0].change();
        return nodes;
    }
    nodes.__proto__.on = function (event, callback) {
        if (typeof callback === "function") nodes.iterator(function (node) {
            let events = event.split(" ");
            for (let event of events) node.addEventListener(event, callback);
        })
        return nodes;
    }
    nodes.__proto__.trigger = function (eventName) {
        if (typeof eventName === "string") nodes.iterator(function (node) {
            let event = new Event(eventName);
            node.dispatchEvent(event);
        })
        return nodes;
    }
    nodes.__proto__.serialize = function () {
        return new URLSearchParams(new FormData(nodes[0])).toString()
    }
    nodes.__proto__.serializeArray = function () {
        return decodeURIComponent(nodes.serialize()).split("&").map(function (q){let a = decodeURI(q).split("="); return {name:a[0],value:a[1]}});
    }
    nodes.__proto__.serializeObject = function () {
        let obj = {};
        decodeURIComponent(nodes.serialize()).split("&").map(function (q){let a = decodeURI(q).split("=");obj[a[0]] = a[1]});
        return obj;
    }
    nodes.__proto__.is = function (s) {
        for (let el of $(s)) if (el === nodes[0]) return true;
        return false;
    }
    nodes.__proto__.fadeOut = function (duration = 150, callback = new Function) {
        nodes.iterator(function (node) {;
            if (node instanceof HTMLElement) fadeOut(node, duration);
        })
        function fadeOut (node, duration, i = 100) {
            if (i >= 0) {
                setTimeout(function () {
                    fadeOut(node, duration, i - 5);
                }, duration/20);
                node.style.setProperty("opacity", i/100);
            }
            else node.style.setProperty("display", "none"), callback(nodes);
        }
        return nodes;
    }
    nodes.__proto__.fadeIn = function (duration = 150, callback = new Function) {
        nodes.iterator(function (node) {
            node.style.setProperty("display", "block");
            fadeIn(node, duration);
        })
        function fadeIn (node, duration, i = 0) {
            if (i <= 100) {
                setTimeout(function () {
                    fadeIn(node, duration, i + 5);
                }, duration/20);
                node.style.setProperty("opacity", i/100);
            }
            else callback(nodes)
        }
        return nodes;
    }

	return nodes;
}

Query.__proto__.ajax = main.ajax.send;
Query.__proto__.get = (function (t = {}) {
	t.method = "GET";
    if (typeof t.data === "object") t.url = `${t.url}?${new URLSearchParams(t.data).toString()}`;
	return main.ajax.send(t);
})
Query.__proto__.post = (function (t = {}) {
	t.method = "POST";
	return main.ajax.send(t);
})

function $ (selector) {
	return new Query(selector);
}

main.page.load();

window.onbeforeunload = function () {
    sessionStorage.setItem("scrollY", window.pageYOffset);
    sessionStorage.setItem("scrollPage", main.page.pathname());
}

String.prototype.capitalise = function () {
    return this.trim().replace(/^./, (c) => c.toUpperCase());
}
main.cookies = document.cookie.split(";").reduce((e,t)=>{const[c,n]=t.trim().split("=").map(decodeURIComponent);try{return Object.assign(e,{[c]:JSON.parse(n)})}catch(t){return Object.assign(e,{[c]:n})}},{});