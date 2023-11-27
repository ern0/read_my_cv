document.addEventListener("DOMContentLoaded", function(event) {

	roles = collect_roles();
	hide_all();
	show_role(roles[0]);

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
	for (let elm of role_elms) {
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
	console.log(query);
	const role_elms = document.querySelectorAll(query);
	for (let elm of role_elms) {
		show_elm(elm);	
	}

}

function quote(str) {
	return "\"" + str + "\"";
}
