document.addEventListener("DOMContentLoaded", function(event) {

	roles = collect_roles();
	hide_all();

	let req_tags = parse_req();
	if (req_tags == null) {
		req_tags = pick_default_roles(roles);
	} 
	for (const req of req_tags) {
		show_role(req);
	}

});

function collect_roles() {

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

function parse_req() {

	const url_params = new URLSearchParams(window.location.search);
	const tags = url_params.get("tags");
	if (tags == null) return null;

	return tags.split(",");
}

function pick_default_roles(roles) {
	return [roles[0]];
}
