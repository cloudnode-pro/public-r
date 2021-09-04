/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
 if (typeof main !== "object") throw new Error("core library missing; nothing to extend");
main.init = function (app, el, options = {}) {
	const apps = {
		codeInput: function (el, options) {
			typeof options.digits !== "number" ? options.digits = 6 : void(0);
			el.innerHTML = `<div class="input-group input-group-digit" style="width:${Math.ceil(options.digits * 42.5)}"px></div><input type="hidden" name="code">`;
			el = el.querySelector(".input-group");
			for (let i = 0; i < options.digits; ++i) {
				const input = document.createElement("input");
				input.type = "text";
				input.classList.add("form-control", "form-control-digit");
				input.placeholder = "-";
				input.autocomplete = "one-time-code";
				input.name = `n${Date.now()}${i}`;
				el.append(input);
				input.addEventListener("input", function () {
					input.value = input.value.replace(/[^\d]/g, "");
					if (input.value.length > 1) {
						let val = input.value.substr(0, options.digits - i).split(""); //if not split, string prototypes are looped as well...
						for (let j in val) el.querySelector(`.form-control-digit:nth-child(${+j + i + 1})`).value = val[j];
						if (i + val.length < options.digits) el.querySelector(`.form-control-digit:nth-child(${i + val.length + 1})`).focus();
						else el.querySelector(`.form-control-digit:nth-child(${i + val.length})`).focus()
					}
					else if (input.value.length > 0 && i < options.digits - 1) el.querySelector(`.form-control-digit:nth-child(${i + 2})`).focus();
					input.value[0] ? input.value = input.value[0] : void(0);
				});
				if (i > 0) {
					input.addEventListener("keyup", e => {
						let code = "";
						el.querySelectorAll(`.form-control-digit`).forEach(j => {
							code += j.value;
						});
						el.querySelector("[name=code]").value = code;
						el.querySelector("[name=code]").dispatchEvent(new Event("change"));
						if ([8, 46, 37].includes(e.keyCode)) {
							el.querySelector(`.form-control-digit:nth-child(${i})`).focus();
							el.querySelector(`.form-control-digit:nth-child(${i})`).setSelectionRange(0, el.querySelector(`.form-control-digit:nth-child(${i})`).value.length);
						}
					})
				}
			}
		},
		console: function (el, options) {
			main.page.loadScriptOnce("/r/js/mc-colors.js", function () {
				if (typeof options !== "object") options = {text:"",callbacks:{},label:"$"};
				if (typeof options.label !== "string") options.label = "$";
				if (typeof options.text !== "string") options.text = "";
				if (typeof options.callbacks !== "object") options.callbacks = {};
				let lines = options.text.split("\n");
				let inputHistory = [];
				for (let i in lines) lines[i] = `<div class="line">${main.MinecraftColorCodes.toHTML(lines[i])}</div>`;
				el.html(`<div class="console"><div class="console-view">${lines.join("")}</div><div class="console-input"><div class="input-group"><label class="input-group-text" for="consoleInput">${options.label}</label><input type="text" class="form-control px-0" placeholder="Type a command..." aria-label="${options.label}" id="consoleInput"></div></div></div>`);
				if (typeof options?.callback === "function") options.callback(el, options);
			});
		},
		dropdownSearch: function (el) {
			el.addClass("dropdown-search");
			el.html(`<div class="px-2 pb-2"><input dropdown-search class="form-control form-control-sm form-control-light" palceholder="${main.langData.translate("search...")}"></div>${el.html()}`);
			el.find("[dropdown-search]").input(function () {
				let v = $(this).val().trim().toLowerCase();
				$(el[0]).find("li").iterator(function ($li) {
					if (!$($li).text().toLowerCase().includes(v)) $($li).addClass("d-none");
					else $($li).removeClass("d-none");
				});
			});
			$(el[0]).parent(".dropdown").on("shown.bs.dropdown", function () {
				$(el[0]).find("[dropdown-search]").focus().val("").trigger("input");
			});
		}
	}
	if (typeof apps[app] === "function") return apps[app](el, options);
	throw new Error(`init.js: enoent application "${app}"`)
}