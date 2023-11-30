document.addEventListener("DOMContentLoaded", main);

function main() {
	
	const dom_roles = collect_dom_roles();
	let req_roles = update_req_roles(dom_roles);
	create_sidepanel(req_roles, dom_roles);
}

function update_req_roles(dom_roles) {

	let req_roles = parse_req_roles();	
	req_roles = normalize_req_roles(req_roles, dom_roles);
	update_dom_with_roles(req_roles);
	replace_url_roles(req_roles);

	return req_roles;
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

	return Object.keys(tags);
}

function update_dom_with_roles(req_roles) {

	hide_all();
	for (const req of req_roles) {
		show_role(req);
	}

}

function replace_url_roles(roles) {

	let params = new URLSearchParams(window.location.search);
	params.set("roles", roles.join(","));

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
	if (tags == null) return null;

	return tags.split(",");
}

function normalize_req_roles(req_roles, collected_roles) {

	if (req_roles == null) {
		req_roles = [];
	}
	if (req_roles.length == 0) {
		req_roles = pick_default_roles(collected_roles);
	}

	req_roles = validate_req_roles(req_roles, collected_roles);

	if (req_roles.length == 0) {
		req_roles = pick_default_roles(collected_roles);
	}

	return req_roles;
}

function pick_default_roles(roles) {
	return [roles[0]];
}

function validate_req_roles(req_roles, valid) {

	validated = [];

	for (role of req_roles) {
		if (!valid.includes(role)) continue;
		validated.push(role);
	}

	return validated;
}

function create_sidepanel(req_roles, dom_roles) {

	let content = "";
	for (role of dom_roles) {
		content += "<input";
		content += " class=" + quote("check");
		content += " type=" + quote("checkbox");
		content += " id=" + quote("check-" + role);
		content += " name=" + quote(role);
		content += " onclick=" + quote("check_clicked('" + role + "');");
		if (req_roles.includes(role)) {
			content += " checked";
		}
		content += " /> " + role;
		content += "<br/>";
	}

	let sidepanel = document.querySelector(".sidepanel");
	sidepanel.innerHTML = content;

}

function check_clicked(role) {

	let req_roles = parse_req_roles();
	req_roles = req_roles.filter(function(item) {
			return item !== role;
	})
	
	update_req_roles();
}
