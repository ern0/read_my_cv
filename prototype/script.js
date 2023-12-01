document.addEventListener("DOMContentLoaded", main);

function main() {
	
	app = {};

	collect_dom_tags();
	create_sidepanel();

    set_default_req_tags();
    parse_url_req_tags();
    
	update_document();
    //update_url();
	//update_sidepanel();
    
    /// http://localhost:8080/cv.html?tags=role:prosti,role:pedmed,happy,innnn,return,xxxxx&a=12121
}

function collect_dom_tags() {

	app.tags = {};

	const elms = document.querySelectorAll("[cv]");

	for (const elm of elms) {
		const tags = elm.attributes["cv"].value.split(",");
		for (const tag of tags) {

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

	let sidepanel = document.querySelector(".sidepanel");
	sidepanel.innerHTML = render_sidepanel();
}

function render_sidepanel() {

	let content = "";

    for (const category in app.tags) {
        content += render_sidepanel_header(category);
        for (const tag in app.tags[category]) {
            content += render_sidepanel_item(category, tag);
        }
	}

    return content;
}

function render_sidepanel_header(category) {

    let content = "";

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

    const widget_id = widget_mkid(category, tag);
    let content = "";

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

    let content = "";
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

function widget_clicked(category, tag) {

    console.log(category, tag); /// TBD
	
}

function set_default_req_tags() {

    app.req = {};

    for (const category in app.tags) {
        if (category[0] == "_") continue;

        for (const tag in app.tags[category]) {
            register_req(category, tag);
            break;
        }
	}
}

function parse_url_req_tags() {  

	const url_params = new URLSearchParams(window.location.search);
	let tags = url_params.get("tags");
	if (tags == null) tags = "";
	
	const tag_list = tags.split(",");
    for (const url_tag of tag_list) {

        let kv = parse_tag(url_tag);
        const category = kv[0];
        const tag = kv[1];

        if (!(category in app.tags)) continue;
        if (!(tag in app.tags[category])) continue;

        register_req(category, tag);
    }
}

function register_req(category, tag) {

    let append = true;
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

    for (const category in app.tags) {
        for (const tag in app.tags[category]) {
            for (let elm of app.tags[category][tag]) {
                hide_elm(elm);	
            }
        }
    }
}

function update_document_show_req() {

    for (const category in app.req) {
        for (const tag of app.req[category]) {
            for (let elm of app.tags[category][tag]) {                
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

	const old_disp = elm.style.display;
	if (old_disp != "none") return;

	elm.style.display = elm.getAttribute("_style_display");
}


function update_url() {

	let params = new URLSearchParams(window.location.search);
	params.set("roles", app.req_roles.join(","));

	let url = window.location.origin;
	url += window.location.pathname;
	url += "?" + params.toString();
	url = url.replaceAll("%2C", ",");

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






function update_sidepanel() {

	const check_elms = document.querySelectorAll(".check");
	for (const elm of check_elms) {
        const role = check_id_parse_role(elm.id);
		elm.checked = app.req_roles.includes(role);
	}
}
