if (typeof main !== "object") throw new Error("core library missing; nothing to extend");
main.init = function (app, $el, options = {}) {
	const apps = {
		codeInput: function ($el, options) {
			typeof options.digits !== "number" ? options.digits = 6 : void(0);
			let $oel = $el;
			$el.html(`<div class="input-group input-group-digit" style="width:${Math.ceil(options.digits * 42.5)}"px></div><input type="hidden" name="code">`);
			$el = $el.find(".input-group");
			for (let i = 0; i < options.digits; ++i) $el.append(`<input type="text" class="form-control form-control-digit" placeholder="-" autocomplete="one-time-code" name="n${Date.now()}${i}">`)
			let $codeInput = $el.find("input"),
			    inputs = [];
			$codeInput.iterator(function (i) {
			  inputs.push(i);
			})
			for (let input of inputs) {
			  let $input = $(input),
			      i = inputs.indexOf(input);
			  $input.input(function () {
			    input.value = input.value.replace(/[^\d]/g, "");
			    if (input.value.length > 1) {
			      let val = input.value.substr(0, inputs.length - i).split(""); //if not split, string prototypes are looped as well...
			      for (let j in val) inputs[+j + i].value = val[j];
			      if (i + val.length < inputs.length) inputs[i + val.length].focus();
			      else inputs[i + val.length - 1].focus()
			    }
			    else if (input.value.length > 0 && i < inputs.length - 1) inputs[i+1].focus();
			    input.value[0] ? input.value = input.value[0] : void(0);
			  });
			  if (i > 0) {
			    $input.keyup(function (e) {
			      let code = "";
			      $codeInput.iterator(function (j) {
			        code += j.value;
			      });
			      $("[name=code]").val(code);
			      $("[name=code]").trigger("change");
			      if ([8, 46, 37].includes(e.keyCode)) {
			        inputs[i - 1].focus();
			        inputs[i - 1].setSelectionRange(0, inputs[i - 1].value.length);
			      }
			    })
			  }
			}
		},
		console: function ($el, options) {
			main.page.loadScriptOnce("/r/js/mc-colors.js", function () {
				if (typeof options !== "object") options = {text:"",callbacks:{},label:"$"};
				if (typeof options.label !== "string") options.label = "$";
				if (typeof options.text !== "string") options.text = "";
				if (typeof options.callbacks !== "object") options.callbacks = {};
				let lines = options.text.split("\n");
				let inputHistory = [];
				for (let i in lines) lines[i] = `<div class="line">${main.MinecraftColorCodes.toHTML(lines[i])}</div>`;
				$el.html(`<div class="console"><div class="console-view">${lines.join("")}</div><div class="console-input"><div class="input-group"><label class="input-group-text" for="consoleInput">${options.label}</label><input type="text" class="form-control px-0" placeholder="Type a command..." aria-label="${options.label}" id="consoleInput"></div></div></div>`);
				if (typeof options?.callback === "function") options.callback($el, options);
			});
		},
		dropdownSearch: function ($el) {
			$el.addClass("dropdown-search");
			$el.html(`<div class="px-2 pb-2"><input dropdown-search class="form-control form-control-sm form-control-light" palceholder="${main.langData.translate("search...")}"></div>${$el.html()}`);
			$el.find("[dropdown-search]").input(function () {
				let v = $(this).val().trim().toLowerCase();
				$($el[0]).find("li").iterator(function ($li) {
					if (!$($li).text().toLowerCase().includes(v)) $($li).addClass("d-none");
					else $($li).removeClass("d-none");
				});
			});
			$($el[0]).parent(".dropdown").on("shown.bs.dropdown", function () {
				$($el[0]).find("[dropdown-search]").focus().val("").trigger("input");
			});
		}
	}
	if (typeof apps[app] === "function") return apps[app]($el, options);
	throw new Error(`init.js: enoent application "${app}"`)
}