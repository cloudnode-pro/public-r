/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
/*window.addEventListener("offline", function () {
    main.page.toast({body: {content: "<b>You are offline.</b><br>You can continue using the platform, but some pages and features may not function as expected."},theme: {background: "dark",color: "white",close: "white"},delay: 8000})
});
window.addEventListener("online", function () {
    main.page.toast({body: {content: "You are back online"},theme: {background: "success",color: "white",close: "white"},delay: 3000})
});

main.uiUtils = {
	//fetch the session data into localstorage so we know we're logged in easily
	fetchSession: function () {
		return main.api.session(function (s) {
			if (typeof s.error !== "undefined") localStorage.setItem("__session", false);
			else localStorage.setItem("__session", JSON.stringify(s));
		});
	},
	enableTooltops: function () {
		[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (el) {
		  	return new bootstrap.Tooltip(el, {
		  		delay: {
		  			"show": 500, "hide": 100
		  		},
		  		template: `<div class="tooltip p-0" role="tooltip"><div class="tooltip-inner"></div></div>`
		  	})
		})
	}
}

if (localStorage.__session === undefined) main.uiUtils.fetchSession();


if (main.page.printed) whenPrinted();
else $(document).on("main.page.printed", function () {
	whenPrinted();
});

function whenPrinted () {
	if (typeof bootstrap === "object") main.uiUtils.enableTooltops();
	else $(document).on("main.page.scriptLoaded", function (e) {
	    if (e.detail.scripts.includes("/r/js/bs.js")) {
		   	main.uiUtils.enableTooltops();
		    if (localStorage.gdprConsent === undefined) {
		    	const gdprToast = main.page.toast({body:{content:`${main.langData.translate("We use cookies 🍪 to provide the best user experience we can.")} <a href="/cookies">${main.langData.translate("Read more")}</a>.<button class="btn btn-link d-block px-0 mt-1" data-bs-dismiss="toast">${main.langData.translate("Accept")}</a>`},autohide:false,theme:{background:"dark",color:"white"}});
		    	gdprToast._element.querySelector(".btn").addEventListener("click", () => {
		    		localStorage.setItem("gdprConsent", "true");
		    	});
		    }
		}
	});


	$("form[action][method='get']").submit(function (e) {
	    e.preventDefault();
	    let $this = $(this);
	    main.page.pop(`${$this.attr("action")}?${$this.serialize()}`);
	});

	if (location.pathname === "/") {
		const navbarCollapse = document.getElementById("navbar");
		const navbar = document.querySelector(".navbar");
		navbarCollapse.addEventListener("show.bs.collapse", function () {
			navbar.classList.remove("navbar-dark");
			navbar.classList.add("navbar-light");
		});
		navbarCollapse.addEventListener("hide.bs.collapse", function () {
	        setTimeout(function () {
			    navbar.classList.remove("navbar-light");
			    navbar.classList.add("navbar-dark");
	        }, 260);
		});
	}
}*/
const pageTriggers = {
	"/errors/404": {
		inited: false,
		init: function () {

		},
		trigger: async function () {
			const promise = new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve('foo');
				}, 3000);
			});
			return promise;
		}
	}
}

document.addEventListener("main.navigate", () => {
	const callback = () => loader.hide(100);
	if (pageTriggers[page.handle] === undefined) return callback();
	function init () {
		if (typeof pageTriggers[page.handle].init === "function") {
			const response = pageTriggers[page.handle].init();
			if (response instanceof Promise) response.then(trigger);
			else trigger();
		}
		else trigger();
	}
	function trigger () {
		if (typeof pageTriggers[page.handle].trigger === "function") {
			const response = pageTriggers[page.handle].trigger();
			if (response instanceof Promise) response.then(callback);
			else callback();
		}
		else callback();
	}
	init();
});