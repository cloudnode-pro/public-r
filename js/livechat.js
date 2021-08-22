function LiveChat () {
	this.open = function () {
		if (this.element !== null) return this.element.classList.remove("collapsed");
		this.element = document.createElement("div");
		this.element.classList.add("cloudnode-livechat", "shadow", "collapsed");
		if (typeof main.sockets.livechat !== "object" || !main.sockets.livechat.connected) {
			const header = document.createElement("div");
			const body = document.createElement("div");
			this.element.append(header, body);
			header.classList.add("cloudnode-livechat-header");
			body.classList.add("cloudnode-livechat-body", "darker");
			const close = document.createElement("button");
			const title = document.createElement("h1");
			const subtitle = document.createElement("p");
			header.append(close, title, subtitle);
			close.classList.add("cloudnode-livechat-icon-button");
			close.innerHTML = `<span class="icon-tt icon-close"></span>`;
			title.classList.add("d-1", "fw-bold");
			title.innerText = typeof main.session.user === "object" ? `Hi, ${main.session.user.name.split(" ")[0]}!` : `Hey 👋`;
			subtitle.classList.add("opacity-7", "h5", "mb-3");
			subtitle.innerText = `What can we do to help?`;
			(3).times((i, max) => {
				const card = document.createElement("div");
				body.append(card);
				card.classList.add("cloudnode-livechat-card", "elevated", "shadow-sm")
				if (i < max - 1) card.classList.add("mb-3");
				switch (i) {
					case 0: {
						const title = document.createElement("h5");
						const subtitle = document.createElement("p");
						const button = document.createElement("button");
						card.append(title, subtitle, button);
						title.innerText = "Start a conversation";
						subtitle.classList.add("opacity-7");
						subtitle.innerText = "Click the button to chat with a live person.";
						button.classList.add("btn", "btn-primary", "px-4", "py-2", "mt-2");
						button.innerText = "New conversation";
						break;
					}
					case 1: {
						card.innerHTML = `<h5>Find an answer quickly</h5><form class="input-group mt-3" action="https://${main.company.domain}/support/search"><input type="text" class="form-control" placeholder="Search Help Center" aria-label="Search Help Center" id=q name=q><button class="btn btn-primary" type="submit">Go</button></form>`;
						break;
					}
					case 2: {
						// todo: fetch status api
						const title = document.createElement("h5");
						const subtitle = document.createElement("p");
						card.append(title, subtitle);
						title.innerText = `Status: All services operational`;
						subtitle.classList.add("opacity-7", "mb-0");
						subtitle.innerText = `Last updated 5 minutes ago. Click for more information.`;
						card.style.cursor = "pointer";
						card.addEventListener("click", () => {
							main.page.pop("/status");
						})
						break;
					}
				}
			});
			document.body.appendChild(this.element);
		}
		else {
			// continue chat
		}
	}
	this.connect = function () {
		if (typeof main.sockets.livechat !== "object" || !main.sockets.livechat.connected) {
			return;
		}
		else {
			// continue
		}
	}
	this.collapse = function () {

	}
	this.handlers = {
		message: function (message, side) {
			const lastMessage = this.lastMessage;
			message = new LiveChatMessage(message);
			this.lastMessage = message;
			if (!document.hasFocus() || element.classList.contains("collapsed")) {
				main.utils.playSound("/r/sound/alert_high-intensity.wav");
				if (lastMessage === null || lastMessage.seen) {
					// change tab title to attract attention
					function changeTabLoop () {
						if (livechat.lastMessage.seen) {
							socket.emit("seen");
							return;
						}
						const title = document.title;
						document.title = `New Message | ${title}`;
						setTimeout(() => {
							document.title = title;
							setTimeout(changeTabLoop, 2000);
						}, 2000);
					}
					changeTabLoop();
				}
			}
			else {
				main.utils.playSound("/r/sound/notification_simple-01.wav");
			}
		}
	}
	this.lastMessage = null
	this.element = null
	this.socket = null
};


if (typeof main === "object") main.LiveChat = LiveChat;


// constructors
function LiveChatMessage (id, room, payload, sender, sent, seen, side) {
	if (typeof payload !== "object" || typeof payload.content !== "string" || typeof payload.type !== "string" || !["left","right"].includes(side)) throw new Error("Invalid message properties.");
	this.id = id;
	this.room = room;
	this.type = payload.type;
	this.content = payload.content;
	this.sender = sender;
	this.sent = new Date(sent);
	this.seen = seen === true;
	this.side = side;

	this.createHtml = function () {
		const d = document.createElement("div");
		switch (this.type) {
			case "normal":
				d.classList.add("cloudnode-livechat-message");
				if (side === "right") d.classList.add(side);
				const content = document.createElement("div");
				content.classList.add("cloudnode-livechat-message-content");
				content.innerText = this.content;
				const meta = document.createElement("div");
				meta.classList.add("cloudnode-livechat-message-meta");
				meta.innerText = `${side === "left" ? this.sender.name.split(" ")[0] : (this.seen ? "Seen" : "Not yet seen")} • ${new Date(this.sent).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
				d.appendChild(content);
				d.appendChild(meta);
				break;
			case "special":
				d.classList.add("cloudnode-livechat-message");
				const special = document.createElement("div");
				special.classList.add("cloudnode-livechat-message-special");
				special.innerText = payload.content;
				const time = document.createElement("span");
				time.classList.add("opacity-7", "ms-2", "small");
				time.innerText = new Date(this.sent).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
				special.appendChild(time);
				d.appendChild(special);
				break;
		}
		return d;
	}
	this.html = this.createHtml();
	if (["normal"].includes(this.type))
		this.markSeen = function () {
			this.seen = true;
			if (this.side === "right") this.html.querySelector(".cloudnode-livechat-message-meta").innerText = `Seen • ${new Date(this.sent).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
		}
}