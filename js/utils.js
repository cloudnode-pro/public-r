/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
main.page.toast = function (options) {
	let id = `toast${Date.now()}`;
	if (typeof options !== "object") options = {};
	if (typeof options.theme !== "object") options.theme = {};
	if (typeof options.autohide !== "boolean") options.autohide = true;
	if (typeof options.delay !== "number") options.delay = 5000;
	if (!options.body) options.body = {};
	if (!options.body.content) options.body.content = "";
	let html = `<div class="toast${typeof options.header !== "object" ? " align-items-center" : ""}${options.theme.color ? ` text-${options.theme.color}` : ""}${options.theme.background ? ` bg-${options.theme.background} border-0` : ""}" role="alert" aria-live="assertive" aria-atomic="true" data-toast="${id}">`;
	if (typeof options.header === "object") {
		html += `<div class="toast-header">`;
		if (typeof options.header.image === "object" && options.header.image.url && options.header.image.alt) html += `<img src="${options.header.image.url}" class="rounded me-2" alt="${options.header.image.alt}" height=20 width=20>`;
		if (options.header.title) html += `<strong class="me-auto">${options.header.title}</strong>`;
		if (options.header.time) html += `<small>${options.header.time instanceof Date ? getRelativeTime(options.header.time).capitalise() : getRelativeTime(new Date(options.header.time)).capitalise()}</small>`;
		html += `<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
	}
	if (typeof options.header !== "object") html += `<div class="d-flex">`;
	html += `<div class="toast-body">${options.body.content}</div>`;
	if (typeof options.header !== "object") html += `<button type="button" class="btn-close${options.theme.close ? ` btn-close-${options.theme.close}` : ""} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
	html += `</div>`;
	let $toast = $(".toast-container").append(html).find(`[data-toast="${id}"]`);
	new bootstrap.Toast($toast[0], {
		delay: options.delay,
		autohide: options.autohide
	}).show();
	$toast[0].addEventListener('hidden.bs.toast', function () {
		this.remove();
	})
	return $toast;
}


function getRelativeTime (d1, d2 = new Date()) {
	let rtf = new Intl.RelativeTimeFormat("en", {numeric: "auto"}),
		elapsed = d1 - d2,
		units = {
			year  : 24 * 60 * 60 * 1000 * 365,
			month : 24 * 60 * 60 * 1000 * 365/12,
			day   : 24 * 60 * 60 * 1000,
			hour  : 60 * 60 * 1000,
			minute: 60 * 1000,
			second: 1000
		}

	for (let u in units) 
		if (Math.abs(elapsed) > units[u] || u == "second") 
			return rtf.format(Math.round(elapsed/units[u]), u)
}

main.utils = {
	readableBytes: function (input, suffix = "B") {
		if (input < 1000) return `${input}${suffix}`;
		else {
			let i = Math.floor(Math.log(input) / Math.log(1000));
            return Math.round(input / Math.pow(1000, i) * 100) / 100 + ' KMGTP'.charAt(i) + suffix;
        }
	},
	parseQuery: function (queryString = location.search) {
	    let query = {},
	    	pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
	    for (let pair of pairs) {
	        pair = pair.split('=');
	        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
	    }
	    return query;
	}
}

main.page.modal = function ({header, body, footer, options}) {
	//hide any other open modals
	const modals = $(".modal.show, .modal-backdrop.show");
	modals.removeClass("show");
	setTimeout(function () {
		modals.remove();
	}, 150)
	if (typeof options !== "object") options = {};
	if (typeof options.close !== "boolean") options.close = true;
	let id = `modal${Date.now()}`;
	let html = `<div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="title${id}" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div class="modal-content">`;
	if (typeof header === "string") header = {title:header};
	if (typeof header === "object") html += `<div class="modal-header"><h5 class="modal-title" id="title${id}">${header.title}</h5>${(typeof header.close === "boolean" && header.close === false) || (typeof options.close === "boolean" && options.close === false) ? "" : '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'}</div>`;
    if (typeof body === "object") html += `<div class="modal-body${typeof body.class === "string" ? ` ${body.class}` : ""}">${body.content}</div>`;
    if (typeof footer !== "object") footer = {};
    if (typeof footer.buttons !== "object" && typeof options.close === "boolean" && options.close === true) footer.buttons = [{
    	class: "btn btn-secondary",
    	close: true,
    	text: "Close"
    }];
    else footer.buttons = [];
    if (footer.buttons.length > 0) {
    	html += `<div class="modal-footer">`;
    	for (let button of footer.buttons) html += `<button type="button" class="${typeof button.class === "string" ? button.class : "btn btn-secondary"}"${typeof button.close === "boolean" && button.close === false ? "" : ' data-bs-dismiss="modal"'}>${button.text}</button>`
    	html += `</div>`;
    }
	html += `</div></div></div>`;
	let $modal = $("body").append(html).find(`#${id}`);
	let modal = new bootstrap.Modal($modal[0], {
		keyboard: options.close !== false,
		focus: options.focus ?? true,
		backdrop: options.close === false ? "static" : true
	});
	modal.show();

	$modal.on("hidden.bs.modal", function () {
		$modal.remove();
	})

    return [$modal, modal];
}

main.utils.fetch = function () {
    if (typeof window.fetch !== "function") throw new Error("Fetch API not supported.");
    else {
        const request = fetch(...arguments);
        request.then(response => {
            console.log(response.status)
        });
        return request;
    }
}