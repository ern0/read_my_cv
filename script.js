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

function main(url) {

	app = {};

	if (typeof url == "string") {
		app.url = url;
		render();
		hide_sidepanel();
	} else {
		app.url = window.location.href;
		render();
		create_sidepanel();
	}

}

function render() {

	collect_dom_tags();
	parse_url();
	update_url();
	update_version();
	update_page();
}

function collect_dom_tags() {

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

	var a = app.url.split("?")
	if (a.length < 2) return;
	var a = a[1].split("&");
	var url_parms = {}

	for (index = 0; index < a.length; index++) {
		var parm = a[index].split("=");
		url_parms[parm[0]] = parm[1];
	}

	var verbs = ["show", "hide"];
	for (var verb_index = 0; verb_index < verbs.length; verb_index++) {
		var verb = verbs[verb_index];

		var tags = url_parms[verb];
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

function hide_sidepanel() {
	var elms = document.querySelectorAll("[class=side]");
	elms[0].style.display = "none";
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

	var content = "<td"
	content += " id=" + quote("ambig_" + field + "_" + tag);
	content += " class=" + quote("side_item_td");
	content += ">";
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

function render_sidepanel_item_label(tag) {

	var content = "<td";
	content += " id=" + quote("ambig_label_" + tag);
	content += " class=" + quote("side_item_label");
	content += ">";
	content += "&nbsp;" + tag + "&nbsp;";
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

	var checked = document.getElementById(id).checked;
	var a = id.split("_");
	var verb = a[0];
	var tag_or_set = a[1];

	if ((verb == "show") && (!checked)) verb = "hide";
	if ((verb == "auto") && (!checked)) verb = "explicit";

	if (tag_or_set.indexOf("-") < 0) {
		proc_click_tag_show(tag_or_set, verb);
	} else {
		if ((verb == "show") || (verb == "hide")) {
			proc_click_set_show(tag_or_set, verb);
		} else {
			proc_click_set_auto(tag_or_set, verb);
		}
	}

	update_url();
	update_version();
	update_page();
}

function proc_click_tag_show(tag, verb) {

	app.tags[tag] = verb;

	for (var set in app.sets) {
		if (set.indexOf(tag) < 0) continue;
		proc_adjust_auto(set);
	}
}

function proc_click_set_show(set, verb) {
	app.sets[set][0] = verb;
	proc_adjust_auto(set);
}

function proc_click_set_auto(set, verb) {
	app.sets[set][1] = verb;
	proc_adjust_auto(set);
}

function proc_adjust_auto(set) {

	var tag_list = set.split("-");
	var values = {};
	for (var tag_index in tag_list) {
		var tag = tag_list[tag_index];

		var value = app.tags[tag];
		values[value] = "";
	}

	var ambig1 = document.getElementById("ambig_label_" + set);
	var ambig2 = document.getElementById("ambig_show_" + set);
	var ambig3 = document.getElementById("ambig_auto_" + set);

	var show_elm = document.getElementById("show_" + set);
	show_elm.disabled = false;
	var ambigous = true;

	if (app.sets[set][1] == "explicit") {
		ambigous = false;
	} else {
		if (Object.keys(values).length == 1) {
			ambigous = false;
			for (var value in values) {
				show_elm.checked = (value == "show");
				show_elm.disabled = true;
			}
		}
	}

	if (ambigous) {
		ambig1.classList.add("side_item_td_ambigous");
		ambig2.classList.add("side_item_td_ambigous");
		ambig3.classList.add("side_item_td_ambigous");
	} else {
		ambig1.classList.remove("side_item_td_ambigous");
		ambig2.classList.remove("side_item_td_ambigous");
		ambig3.classList.remove("side_item_td_ambigous");
	}
}

function update_version() {

	var elm = document.getElementById("email");
	if (elm == null) return;

	var email = elm.href;
	var a = email.split("@");
	var user = a[0].split("_")[0];
	var domain = a[1];

	var show = "";
	for (var tag in app.tags) {
		if (app.tags[tag] != "show") continue;
		if (show != "") show += "X";
		show += tag;
	}
	for (var set in app.sets) {
		if (app.sets[set][0] != "show") continue;
		if (show != "") show += "X";
		show += set.replace("-","N");
	}

	elm.href = user + "_" + show + "@" + domain;
}

function update_page() {

	for (var tag in app.tags) {
		var elms = document.getElementsByClassName("tag_" + tag);
		update_page_elms(elms, app.tags[tag]);
	}

	for (var set in app.sets) {
		var elms = document.getElementsByClassName("tag_" + set.replace("-"," "));
		update_page_elms(elms, app.sets[set][0]);
	}
}

function update_page_elms(elms, verb) {

	for (var index = 0; index < elms.length; index++) {
		var elm = elms[index];
		if (verb == "show") {
			show_elm(elm);
		} else {
			hide_elm(elm);
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
