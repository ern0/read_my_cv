document.addEventListener("DOMContentLoaded", main);


function main() {

	// Collect tags into app global object
	//
	// app.tags[tag] = none
	// - tag: tag name
	// - none: empty string
	//
	// app.sets[tag_set] = [actual_state, auto_flag]
	// - tag_set: tags separated with "-" sign, e.g. "backend-frontend".
	//   The elements of the set are ordered aphabetically, e.g. "a-b-c"
	// - value: array of 2
	//   - Actual state: "show" or "hide"
	//   - Auto flag: "auto" or "explicit"
	//     If set, the actual state can be changed automatically based
	//     on individual tags' states (see app.tags).
	//     When the auto flag is set, but the situation is ambigous,
	//     (e.g. a="show" and b="hide" => a-b=?), the actual state is
	//     not set automatically, and "ambigous" indicator appears
	//
	collect_dom_tags();

	//create_sidepanel();
	return; /////////////////////////////////////////////////

    set_default_req_tags();
    parse_url_req_tags();

	update_document();
	update_sidepanel();
    update_url();
}

function hide_sidepanel() {

	var elms = document.querySelectorAll("[class=sidepanel]");
	elms[0].style.display = "none";

}

function collect_dom_tags() {

	app = {}
	app.tags = {};
	app.sets = {}

	const elms = document.querySelectorAll("[class]");
	for (var i = 0; i < elms.length; i++) {
		var elm = elms[i];
		var cls_list = elm.attributes["class"].value.split(" ");
		var elm_tags = {}

		for (var j = 0; j < cls_list.length; j++) {
			var tag = cls_list[j];
			if (tag.substring(0,4) != "tag_") continue;
			tag = tag.substring(4);

			app.tags[tag] = "show";
			elm_tags[tag] = "";
		}

		if (Object.keys(elm_tags).length > 1) {
			var tag_set = Object.keys(elm_tags).sort().join("-");
			app.sets[tag_set] = ["show", "auto"];
		}
	}
}


function create_sidepanel() {

	var sidepanel = document.querySelector(".sidepanel");
	sidepanel.innerHTML = render_sidepanel();
}

function render_sidepanel() {

	var content = "";

    for (var tag in app.tags) {
		content += render_sidepanel_tag(tag);
	}

    return content;
}

function render_sidepanel_tag(tag) {

    content = "";

    widget_id = widget_mkid(tag);
    content = "";

    content += "<input";
    content += " class=" + quote("check");
	content += " type=" + quote("checkbox");
    content += " id=" + quote(widget_id);
    content += " name=" + quote(tag);
    content += " onclick=";
    content += quote(render_sidepanel_click_action(tag));
    content += " /> "

    content += "<label for=" + quote(widget_id) + ">";
    content += tag;
    content += "</label>"
    content += "<br/>";

    return content;
}

function render_sidepanel_click_action(tag) {

    content = "";
    content += "widget_clicked(";
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

function widget_mkid(tag) {
    return "widget-" + tag;
}

function parse_url_req_tags() {

	app.req = {}

	url_params = new URLSearchParams(window.location.search);
	tags = url_params.get("tags");
	if (tags == null) tags = "";

	tag_list = tags.split(",");
    for (tag in tag_list) {
		app.req[tag] = ""
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
