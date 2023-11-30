document.addEventListener("DOMContentLoaded", main);

function main() {
	
	app = {};
	collect_dom_roles();
	parse_req_roles();	
	update_req_roles();
	create_sidepanel();

}

function collect_dom_roles() {

	let tags = {};
	const role_elms = document.querySelectorAll("[cv-role]");

	for (const elm of role_elms) {
		for (const attr of elm.attributes) {
			if (attr.name != "cv-role") continue;
			tags[attr.value] = null;
		}
	};

	app.dom_roles = Object.keys(tags);
}

function update_req_roles() {

	normalize_req_roles();
	update_dom_with_roles();
	replace_url_roles();

}

function update_dom_with_roles() {

	hide_all();
	for (const req of app.req_roles) {
		show_role(req);
	}

}

function replace_url_roles() {

	let params = new URLSearchParams(window.location.search);
	params.set("roles", app.req_roles.join(","));

	let url = window.location.origin;
	url += window.location.pathname;
	url += "?" + params.toString();
	url = url.replace("%2C", ",");

	try {		

		history.pushState({}, "", url);

	} catch (ex) {
		if (ex instanceof DOMException) {
			console.warn("Can't rewrite URL for file:///");
		} else {
			throw ex;
		}
	}

}

function hide_all() {

	const role_elms = document.querySelectorAll("[cv-role]");
	for (const elm of role_elms) {
		hide_elm(elm);	
	}
}

function hide_elm(elm) {
	
	const old_disp = elm.style.display;
	if (old_disp == "none") return;

	elm.setAttribute("_style_display", old_disp);
	elm.style.display = "none";
}

function show_elm(elm) {

	const old_disp = elm.style.display;
	if (old_disp != "none") return;

	elm.style.display = elm.getAttribute("_style_display");
}

function show_role(role) {

	const query = "[cv-role=" + quote(role) + "]";
	const role_elms = document.querySelectorAll(query);
	for (let elm of role_elms) {
		show_elm(elm);	
	}

}

function quote(str) {
	return "\"" + str + "\"";
}

function parse_req_roles() {

	const url_params = new URLSearchParams(window.location.search);
	const tags = url_params.get("roles");
	if (tags == null) tags = "";
	
	app.req_roles = tags.split(",");
}

function normalize_req_roles() {

	if (app.req_roles.length == 0) {
		pick_default_roles();
	}

	validate_req_roles();

	if (app.req_roles.length == 0) {
		pick_default_roles();
	}

}

function pick_default_roles() {
	app.req_roles = [app.dom_roles[0]];
}

function validate_req_roles() {

	validated = [];

	for (role of app.req_roles) {
		if (!app.dom_roles.includes(role)) continue;
		validated.push(role);
	}

	app.req_roles = validated;
}

function create_sidepanel() {

	let content = "";
	for (role of app.dom_roles) {
		content += "<input";
		content += " class=" + quote("check");
		content += " type=" + quote("checkbox");
		content += " id=" + quote("check-" + role);
		content += " name=" + quote(role);
		content += " onclick=" + quote("check_clicked('" + role + "');");
		if (app.req_roles.includes(role)) {
			content += " checked";
		}
		content += " /> " + role;
		content += "<br/>";
	}

	let sidepanel = document.querySelector(".sidepanel");
	sidepanel.innerHTML = content;

}

function check_clicked(role) {
	
	if (app.req_roles.includes(role)) {	
		app.req_roles = app.req_roles.filter(function(item) {
				return item !== role;
		});
	} else {
		app.req_roles.push(role);
	}

	update_req_roles();

}
