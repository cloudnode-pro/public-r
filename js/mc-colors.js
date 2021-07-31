/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 *
 *
 * main.MinecraftColorCodes
 * Forked from https://github.com/FoxInFlame/main.MinecraftColorCodes and modified by https://github.com/williamd5
 */
main.MinecraftColorCodes = {
    toHTML: function(s) {
        let d = document.createElement("div");
        return d.appendChild(main.MinecraftColorCodes.parseStyle(s)), d.innerHTML;
    },
    styleMap: {
        "§4": "font-weight:normal;text-decoration:none;color:#ec0505",
        "§c": "font-weight:normal;text-decoration:none;color:#ff495a",
        "§6": "font-weight:normal;text-decoration:none;color:#ff9800",
        "§e": "font-weight:normal;text-decoration:none;color:#ffeb3b",
        "§2": "font-weight:normal;text-decoration:none;color:#4caf50",
        "§a": "font-weight:normal;text-decoration:none;color:#50ff57",
        "§b": "font-weight:normal;text-decoration:none;color:#0dcaf0",
        "§3": "font-weight:normal;text-decoration:none;color:#20c997",
        "§1": "font-weight:normal;text-decoration:none;color:#0d6efd",
        "§9": "font-weight:normal;text-decoration:none;color:#7070e6",
        "§d": "font-weight:normal;text-decoration:none;color:#e8559e",
        "§5": "font-weight:normal;text-decoration:none;color:#7c10f2",
        "§f": "font-weight:normal;text-decoration:none;color:#ffffff",
        "§7": "font-weight:normal;text-decoration:none;color:#bfbfbf",
        "§8": "font-weight:normal;text-decoration:none;color:#6c757d",
        "§0": "font-weight:normal;text-decoration:none;color:#343a40",
        "§l": "font-weight:bold",
        "§n": "text-decoration:underline;text-decoration-skip:spaces",
        "§o": "font-style:italic",
        "§m": "text-decoration:line-through;text-decoration-skip:spaces"
    },
    applyCode: function(s, c) {
        let t = document.createElement("span");
        for (let s of c) t.style.cssText += main.MinecraftColorCodes.styleMap[s] + ";";
        return t.innerHTML = s, t;
    },
    parseStyle: function(s) {
        let e, t, n = s.match(/§.{1}/g) || [],
            r = [],
            l = [],
            a = document.createDocumentFragment();
        s = s.replace(/\n|\\n/g, "<br>");
        for (let e of n) r.push(s.indexOf(e)), s = s.replace(e, "\0\0");
        if (r[0] !== 0) a.appendChild(main.MinecraftColorCodes.applyCode(s.substring(0, r[0]), []));
        for (let c = 0; c < n.length; ++c) {
            if (2 === (t = r[c + 1] - r[c])) {
                for (; 2 === t;) l.push(n[c]), t = r[++c + 1] - r[c];
                l.push(n[c])
            }
            else l.push(n[c]);
            l.includes("§r") && (l = l.slice(l.lastIndexOf("§r") + 1));
            e = s.substring(r[c], r[c + 1]);
            a.appendChild(main.MinecraftColorCodes.applyCode(e, l));
        }
        return a
    }
};