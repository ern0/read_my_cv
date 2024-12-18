document.addEventListener("DOMContentLoaded", main);


function main() {

	app = {};

	collect_dom_tags();

	return; /////////////////////////////////////////////////

	create_sidepanel();

    set_default_req_tags();
    parse_url_req_tags();

	update_document();
	update_sidepanel();
    update_url();

    /// http://localhost:8080/cv.html?tags=role:prosti,role:pedmed,happy,innnn,return,xxxxx&a=12121
}

function collect_dom_tags() {

	app.tags = {};

	const elms = document.querySelectorAll("[class]");

	for (var i = 0; i < elms.length; i++) {
		var elm = elms[i];
		const classes = elm.attributes["class"].value.split(" ");

		for (var j = 0; j < classes.length; i++) {
			var tag = elms[i];
		    const kv = parse_tag(tag);
	    	const key = kv[0];
	    	const value = kv[1];
			register_tag(key, value, elm);
		}
	}
}

function parse_tag(tag) {

    if (tag.includes(":")) {
		const kv = tag.split(":");
		key = kv[0].trim();
		value = kv[1].trim();
    } else {
		key = "_tag";
		value = tag.trim();
    }

    return [key, value];
}

function register_tag(category, tag, elm) {

	if (!(category in app.tags)) app.tags[category] = {};
	if (!(tag in app.tags[category])) app.tags[category][tag] = [];

	app.tags[category][tag].push(elm);

}

function create_sidepanel() {

	var sidepanel = document.querySelector(".sidepanel");
	sidepanel.innerHTML = render_sidepanel();
}

function render_sidepanel() {

	var content = "";

    for (var category in app.tags) {
		content += render_sidepanel_header(category);
		for (tag in app.tags[category]) {
			content += render_sidepanel_item(category, tag);
		}
	}

    return content;
}

function render_sidepanel_header(category) {

    content = "";

    content += "<b>";
    if (category[0] == "_") {
		content += category.substring(1);
    } else {
		content += category;
    }
    content += "</b><br/>";

    return content;
}

function render_sidepanel_item(category, tag) {

    widget_id = widget_mkid(category, tag);
    content = "";

    content += "<input";
    content += " class=" + quote("check");
    if (category[0] == "_") {
	content += " type=" + quote("checkbox");
    } else {
	content += " type=" + quote("radio");
    }
    content += " id=" + quote(widget_id);
    content += " name=" + quote(tag);
    content += " onclick=";
    content += quote(render_sidepanel_click_action(category, tag));
    content += " /> "

    content += "<label for=" + quote(widget_id) + ">";
    content += tag;
    content += "</label>"
    content += "<br/>";

    return content;
}

function render_sidepanel_click_action(category, tag) {

    content = "";
    content += "widget_clicked(";
    content += singlequote(category);
    content += ",";
    content += singlequote(tag);
    content += ");";

    return content;
}

function quote(str) {
	return "\"" + str + "\"";
}

function singlequote(str) {
	return "'" + str + "'";
}

function widget_mkid(category, tag) {
    return "widget-" + category + "-" + tag;
}

function set_default_req_tags() {

    app.req = {};
    app.req["_tag"] = [];

    for (category in app.tags) {
	if (category[0] == "_") continue;

		for (tag in app.tags[category]) {
			register_req(category, tag);
			break;
		}
	}
}

function parse_url_req_tags() {

	url_params = new URLSearchParams(window.location.search);
	tags = url_params.get("tags");
	if (tags == null) tags = "";

	tag_list = tags.split(",");
    for (url_tag in tag_list) {

	kv = parse_tag(url_tag);
	category = kv[0];
	tag = kv[1];

	if (!(category in app.tags)) continue;
	if (!(tag in app.tags[category])) continue;

	register_req(category, tag);
    }
}

function register_req(category, tag) {

    append = true;
    if (category[0] != "_") append = false;
    if (!(category in app.req)) append = false;

    if (append) {
		app.req[category].push(tag);
    } else {
		app.req[category] = [tag];
    }

}

function update_document() {

    update_document_hide_all();
    update_document_show_req();
}

function update_document_hide_all() {

    for ( category in app.tags) {
	for ( tag in app.tags[category]) {
	    for ( elm in app.tags[category][tag]) {
		hide_elm(elm);
	    }
	}
    }
}

function update_document_show_req() {

    for ( category in app.req) {
	for ( tag in app.req[category]) {
	    for ( elm in app.tags[category][tag]) {
		show_elm(elm);
	    }
	}
    }
}

function hide_elm(elm) {

	const old_disp = elm.style.display;
	if (old_disp == "none") return;

	elm.setAttribute("_style_display", old_disp);
	elm.style.display = "none";
}

function show_elm(elm) {

	 old_disp = elm.style.display;
	if (old_disp != "none") return;

	elm.style.display = elm.getAttribute("_style_display");
}

function update_sidepanel() {

    update_sidepanel_hide_all();
    update_sidepanel_show_req();

}

function update_sidepanel_hide_all() {

    for ( category in app.tags) {
	for ( tag in app.tags[category]) {

	     widget_id = widget_mkid(category, tag);
	    elm = document.getElementById(widget_id);
	    elm.checked = false;

	}
    }
}

function update_sidepanel_show_req() {

    for ( category in app.req) {
	for ( tag in app.req[category]) {

	     widget_id = widget_mkid(category, tag);
	    elm = document.getElementById(widget_id);
	    elm.checked = true;

	}
    }
}

function widget_clicked(category, tag) {

    if (category[0] == "_") {
	widget_clicked_checkbox(category, tag);
    } else {
	widget_clicked_radio(category, tag);
    }

    update_document();
    update_sidepanel();
    update_url();
}

function widget_clicked_radio(category, tag) {

    if (app.req[category].includes(tag)) return;
    app.req[category] = [tag];
}

function widget_clicked_checkbox(category, tag) {

    if (app.req[category].includes(tag)) {
	app.req[category] = app.req[category].filter(
	    function(item) { return item != tag }
	);
    } else {
	app.req[category].push(tag);
    }
}

function update_url() {

	 params = new URLSearchParams(window.location.search);
	params.set("tags", render_taglist());

	 url = window.location.origin;
	url += window.location.pathname;
	url += "?" + params.toString();
	url = url.replaceAll("%2C", ",");
	url = url.replaceAll("%3A", ":");

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

function render_taglist() {

    result = "";

    for ( category in app.req) {
	for ( tag in app.req[category]) {

	    if (result != "") result += ",";
	    if (category[0] != "_") result += category + ":";
	    result += tag;
	}
    }

    return result;
}
