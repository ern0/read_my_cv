// These global variables contain the tag states:
//
// app.tags[tag] = state
// - tag: tag name
// - state: "show" or "hide"
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

document.addEventListener("DOMContentLoaded", main);

function main() {

	collect_dom_tags();
	parse_url();
	update_url();
	create_sidepanel();

}

function hide_sidepanel() {

	var elms = document.querySelectorAll("[class=side]");
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

function parse_url() {

	url_params = new URLSearchParams(window.location.search);

	var verbs = ["show", "hide"];
	for (var verb_index = 0; verb_index < verbs.length; verb_index++) {
		var verb = verbs[verb_index];

		var tags = url_params.get(verb);
		if (tags == null) continue;

		var tag_list = tags.split(",");
		for (var tag_index = 0; tag_index < tag_list.length; tag_index++) {
			var tag = tag_list[tag_index];
			if ((typeof app.tags[tag] == "undefined") && (typeof app.sets[tag] == "undefined")) {
				console.warn("invalid tag in URL:", tag);
				continue;
			}

			if (tag.indexOf("-") > -1) {
				app.sets[tag] = [verb, "explicit"];
			} else {
				app.tags[tag] = verb;
			}

		}
	}
}

function make_url() {

	var url = ""

	var verbs = ["show", "hide"];
	for (var verb_index = 0; verb_index < verbs.length; verb_index++) {
		var verb = verbs[verb_index];
		var tag_list = "";

		for (tag in app.tags) {
			if (app.tags[tag] != verb) continue;
			if (tag_list != "") tag_list += ",";
			tag_list += tag;
		}

		for (tag in app.sets) {
			if (app.sets[tag][0] != verb) continue;
			if (tag_list != "") tag_list += ",";
			tag_list += tag;
		}

		if (tag_list != "") {
			if (url == "") {
				url += "?";
			} else {
				url += "&";
			}
			url += verb + "=" + tag_list;
		}
	}

	var base_url = window.location.href.split("?")[0];
	return base_url + url;
}

function update_url() {
	var url = make_url();
    history.pushState({}, null, url);
}


function create_sidepanel() {
	var sidepanel = document.querySelector(".side");
	sidepanel.innerHTML = render_sidepanel();
}

function render_sidepanel() {

	var content = render_sidepanel_header();

    for (var tag_index in app.tags) {
		var show = app.tags[tag_index];
		content += render_sidepanel_item("tag", tag_index, show, "");
	}
    for (var set_index in app.sets) {
		var show = app.sets[set_index][0];
		var auto = app.sets[set_index][1];
		content += render_sidepanel_item("set", set_index, show, auto);
	}

	content += render_sidepanel_footer();

    return content;
}

function render_sidepanel_header() {

	var content = "<table class=" + quote("side_table") + ">";

	content += "<tr class=" + quote("side_head_tr") + ">"
	content += "<td class=" + quote("side_head_td") + ">label</td>"
	content += "<td class=" + quote("side_head_td") + ">show</td>"
	content += "<td class=" + quote("side_head_td") + ">auto</td>"
	content += "</tr>"

	return content;
}

function render_sidepanel_footer() {

	var content = "</table>";

	return content;
}

function render_sidepanel_item(verb, tag, show, auto) {

    var content = "<tr class=" + quote("side_item_tr") + ">";

	content += render_sidepanel_item_label(tag);
	content += render_sidepanel_item_checkbox("show", tag, show == "show");
	if (verb == "tag") {
		content += render_sidepanel_item_blank();
	} else {
		content += render_sidepanel_item_checkbox("auto", tag, auto == "auto");
	}

    content += "</tr>";

	return content;
}

function render_sidepanel_item_checkbox(field, tag, checked) {

	var content = "<td class=" + quote("side_item_td") + ">";
    content += "<input";
    content += " class=" + quote("side_item_checkbox");
	content += " type=" + quote("checkbox");
    content += " id=" + quote(field + "_" + tag);
    content += " name=" + quote(tag);
	if (checked) content += " checked";
    content += " onclick=";
    content += quote(render_sidepanel_click_action(field + "_" + tag));
    content += " /> "
	content += "</td>";

    return content;
}

function render_sidepanel_item_blank() {

	var content = "<td>";
	content += "&nbsp;"
	content += "</td>";

	return content;
}

function render_sidepanel_item_label(text) {

	var content = "<td class=" + quote("side_item_label") +">";
	content += text;
	content += "</td>";

	return content;
}

function render_sidepanel_click_action(id) {

    content = "";
    content += "widget_clicked(";
    content += singlequote(id);
    content += ");";

    return content;
}

function quote(str) {
	return "\"" + str + "\"";
}

function singlequote(str) {
	return "'" + str + "'";
}

function widget_clicked(id) {

	proc_click(id);
	update_url();

}

function proc_click(id) {

	var checked = document.getElementById(id).checked;

	var a = id.split("_");
	var verb = a[0];
	var tag = a[1];

	if ((verb == "show") && (!checked)) verb = "hide";
	if ((verb == "auto") && (!checked)) verb = "explicit";

	if (tag.indexOf("-") < 0) {
		app.tags[tag] = verb;
	} else {
		if ((verb == "show") || (verb == "hide")) {
			app.sets[tag][0] = verb;
		} else {
			app.sets[tag][1] = verb;
		}
	}

}

function hide_elm(elm) {

	var old_disp = elm.style.display;
	if (old_disp == "none") return;

	elm.setAttribute("_style_display", old_disp);
	elm.style.display = "none";
}

function show_elm(elm) {

	var old_disp = elm.style.display;
	if (old_disp != "none") return;

	elm.style.display = elm.getAttribute("_style_display");
}
