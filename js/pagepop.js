/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
main.page.pop = function (url) {
	window.history.pushState({}, url, url);
	sessionStorage.removeItem("scrollY");
	sessionStorage.removeItem("scrollPage");
	main.page.load(location.pathname);
	main.page.loadedScripts = [];
	if (typeof main.sockets.visitor !== "undefined") main.sockets.visitor.emit("page:navigation", JSON.stringify({host:location.hostname,path:location.pathname}));
}

window.onpopstate = function (e) {
	if (event.state !== null) main.page.load(location.pathname);
}

main.page.registerPopHandlers = registerPopHandlers;

function registerPopHandlers () {
	$("a[href]").iterator(function ($this, i) {
		if (!$this.hasAttribute("pop-registered")) {
			$this.setAttribute("pop-registered", "");
			$this.addEventListener("click", function (e) {
				$this = $($this);
				let url = new URL($this.attr("href"), location.href);
				if ($this.attr("href").startsWith("#") || $this.attr("href").startsWith(location.href.split("#")[0] + "#") || $this.attr("href").startsWith(location.pathname.split("#")[0] + "#")) return true;
				else if (e.ctrlKey || $this.attr("target") === "_blank" || (url.hostname !== main.company.domain && !url.hostname.startsWith(`.${main.company.domain}`))) {
					e.preventDefault();
					return window.open($this.attr("href"));
				}
				else {
					e.preventDefault();
					main.page.pop($this.attr("href"));
					return false;
				}
			});
		}
	});
	$("[data-pop]").click(function () {
		let url = $(this).attr("data-pop");
		window.history.pushState({}, url, url);
	});
}

registerPopHandlers();