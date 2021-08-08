/* Copyright (C) 2021 Cloudnode - All Rights Reserved
 * Any use, distribution or modification of this code
 * is subject to the terms of the provided license.
 *
 * The license is available at the root (/) of the
 * repository. If not, please write to:
 * support@cloudnode.pro
 */
if (typeof main !== "object") throw new Error("module main missing");
main.currency = {
	selected: localStorage.currency ?? "EUR",
	list: [undefined, null].includes(sessionStorage.currencies) ? {EUR:{iso: "EUR", symbol: "€", rate: 1, updated:0}} : JSON.parse(sessionStorage.currencies)
}

// check if currencies not cached or over 24 hours since update
if ([undefined, null].includes(sessionStorage.currencies) || Date.now() - (main.currency.list[main.currency.selected]?.updated ?? 0) > 864e5) {
	main.api.currency(function (data) {
		sessionStorage.setItem("currencies", JSON.stringify(data));
		main.currency.list = data;
		render();
	})
}
else render();

function render () {
	$("#currencySelect").html(`<span class="align-middle me-2">${(main.currency.list[main.currency.selected]?.symbol ?? "(error)")}</span><span class="align-middle">${main.currency.selected}</span>`);
	$(".currency-select ul").html("");
	for (let iso in main.currency.list) {
		let symbol = (main.currency.list[iso]?.symbol ?? "(error)");
		$(".currency-select ul").append(`<li><a class="dropdown-item" href="#" data-currency="${iso}"><span class="me-3 align-middle">${symbol}</span><span class="align-middle">${iso}</span></a></li>`);
	}
	main.init("dropdownSearch", $(".currency-select ul"));
	$("[data-currency]").click(function (e) {
		e.preventDefault();
		let iso = $(this).attr("data-currency");
		change(iso);
		$("#currencySelect").html($(this).html())
	});
	renderPrices();
}

function change (iso) {
	main.currency.selected = iso;
	localStorage.setItem("currency", iso);
	renderPrices();
}

function renderPrices () {
	for (let k of document.querySelectorAll("[data-price]")) {
		k.innerHTML = `${(main.currency.list[main.currency.selected]?.prefix ?? true) ? (main.currency.list[main.currency.selected]?.symbol ?? "(error)") : ""}${Number.isNaN(+k.getAttribute("data-price")) ? "-" : Math.ceil(+k.getAttribute("data-price") * main.currency.list[main.currency.selected].rate * 100)/100}${!(main.currency.list[main.currency.selected]?.prefix ?? true) ? main.currency.list[main.currency.selected].symbol : ""}`;
	}
}

main.currency.exports = {
	renderPrices: renderPrices
}