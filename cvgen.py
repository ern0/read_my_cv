#!/usr/bin/env python3

import sys
import time

class Render:

    def __init__(self):
        self.level = 0
        self.nodes = {}
        self.need_indent = True

    def indent(self):
        self.level += 1

    def undent(self):
        self.level -= 1

    def text(self, text):
        if self.need_indent:
            print("  " * self.level, end="")
            self.need_indent = False
        print(text, end="")

    def eol(self):
        self.text("\n")
        self.need_indent = True

    def open(self, node_type, attrib_list = None, single_shot = False, no_eol = False):

        self.nodes[self.level] = node_type

        self.text("<")
        self.text(node_type)

        if attrib_list is not None:
            for (key, value) in attrib_list:
                self.text(" " + key + "=")
                self.text('"' + value + '"')

        if single_shot:
            self.text(" /")
        self.text(">")
        if node_type != "span":
            if not no_eol:
                self.eol()

        if not single_shot:
            self.indent()

    def append_tags(self, tag_list):

        class_value = ""
        if tag_list is not None:
            for tag in tag_list:
                class_value += " tag_" + tag

        return class_value

    def open_section(self, node_type, section_type, tag_list = None):

        class_value = "section section_" + section_type
        class_value += self.append_tags(tag_list)

        attr_list = [ ("class", class_value,) ]
        self.open(node_type, attr_list)

    def open_field(self, node_type, field_type, tag_list, no_eol=False):

        class_value = "field field_" + field_type
        class_value += self.append_tags(tag_list)

        attr_list = [ ("class", class_value,) ]
        self.open(node_type, attr_list, no_eol=no_eol)

    def link(self, url):

        text = url

        if "@" in url:
            if url.startswith("mailto:"):
                text = url.split(":")[1]
        else:
            if not url.startswith("http"):
                url = "https://" + url
                text = url

        self.open("a", [ ("href", url) ])
        self.text(text)
        self.close_last()

    def img(self, file, cls):

        attrib_list = [ ("src", file,), ("class", cls,) ]
        self.open("img", attrib_list, True)

    def close_last(self, no_eol=False):

        self.undent()

        self.text("</")
        self.text(self.nodes[self.level])
        self.text(">")

        if not no_eol:
            self.eol()


class Gen:

    def __init__(self):
        self.is_first_section = True
        self.is_sections_rendered = {}
        self.is_exp_close_needed = False
        self.is_ul_close_needed = False
        self.is_intro_first_line = True
        self.is_intro_open_para = True

    def main(self):

        self.open_file()
        self.render = Render()
        self.process()
        self.file.close()

    def open_file(self):

        if len(sys.argv) < 2:
            print("specify cv file")
            quit(0)

        fnam = sys.argv[1]
        try:
            self.file = open(fnam)
        except FileNotFoundError:
            print("file not found: ",fnam)
            quit(1)
        except:
            print("can't open file: ",fnam)
            quit(1)

    def parse_tags(self):

        tags = []
        tags = self.line.split("#")
        for index in range(0, len(tags)):
            tags[index] = tags[index].strip()
            if index > 0:
                tags[index] = tags[index]
        self.line = tags[0]
        del tags[0]

        return tags

    def process(self):

        self.render_html_pre()

        for self.line in self.file:
            self.line = self.line.strip()
            self.line = self.line.replace("−", "-")

            if self.line.startswith("----"):
                if self.line == "":
                    continue
                self.proc_header()
            else:
                self.proc_body()

        self.render_html_post()

    def render_html_pre(self):

        for node in ("html", "head", "body"):

            self.render.open(node)

            if node == "head":
                self.render.open("meta", [("charset", "UTF-8",)], True)
                self.render.open("link", [("rel", "stylesheet",), ("href", "style.css")])
                self.render.close_last()
                self.render.open("script", [("src", "script.js",)])
                self.render.close_last()
                self.render.close_last()

        self.render.open("div", [("class", "sidepanel",)])
        self.render.text("side")
        self.render.eol()
        self.render.close_last()

        self.render.open("div", [("class", "side side_left",)])

    def render_html_post(self):

        self.close_exp_ul_if_needed()
        self.close_exp_header_if_needed()

        for i in range(4):
            self.render.close_last()

    def proc_header(self):

        self.close_exp_ul_if_needed()
        self.close_exp_header_if_needed()

        self.line = self.line.replace("----","").strip()
        self.section_tags = self.parse_tags()
        self.section_type = self.line

        if self.is_first_section:
            self.is_first_section = False
        else:
            self.render.close_last()

        if self.section_type == "intro":
            self.render.close_last()
            self.render.open("div", [("class", "side side_right",)])

        self.render_title()

        self.render.open_section("div", self.section_type, self.section_tags)

        self.is_first_line = True
        self.exp_features = {}

    def render_title(self):

        word = None
        img = None

        if self.section_type == "skills":
            word = "Skills"
        if self.section_type == "languages":
            word = "Languages"
        if self.section_type == "experience":
            word = "Experience"
            img = "img/exp.png"
        if self.section_type == "education":
            word = "Education"
            img = "img/edu.png"

        if word is None:
            return
        if word in self.is_sections_rendered:
            return

        self.is_sections_rendered[word] = None

        attrs = []
        if img is not None:
            attrs.append( ("src", img,) )
        attrs.append( ("class", "image image_" + self.section_type,) )
        self.render.open("img", attrs, True)

        self.render.open("div",[("class", "title")])
        self.render.text(word)
        self.render.eol()
        self.render.close_last()

    def proc_body(self):

        self.tags = self.parse_tags()

        if self.section_type == "intro":
            self.proc_item_intro()

        if self.line == "":
            return

        if self.section_type == "title":
            self.proc_item_title()
        elif self.section_type == "contact":
            self.proc_item_contact()
        elif self.section_type == "skills":
            self.proc_item_skills_langs()
        elif self.section_type == "languages":
            self.proc_item_skills_langs()
        elif self.section_type == "experience":
            self.proc_item_experience()

        self.is_first_line = False

    def proc_item_title(self):

        if self.is_first_line:
            self.render.open_field("div", "name", self.tags)
        else:
            self.render.open_field("div", "position", self.tags)

        self.render.text(self.line)
        self.render.eol()
        self.render.close_last()

    def proc_item_contact(self):

        contact_type = self.get_contact_type()
        self.render.open_field("div", contact_type, self.tags)

        self.render.img("img/" + contact_type + ".png", "feature_contact_icon")

        if contact_type == "email" or contact_type == "github":
            self.render.link(self.line)
        else:
            self.render.text(self.line)
            self.render.eol()

        self.render.close_last()

    def get_contact_type(self):

        contact_type = "phone"
        for char in self.line:
            if char not in "1234567890+-/. ":
                contact_type = "address"

        if "@" in self.line or self.line.startswith("mailto:"):
            contact_type = "email"
        if "github.com" in self.line:
            contact_type = "github"

        return contact_type

    def proc_item_skills_langs(self):

        self.render.open_field("div", self.section_type, self.tags)

        (skill, stars,) = self.split_skill()

        self.render.open("span", [("class", "feature_skill",)])
        self.render.text(skill)
        self.render.open("span", [("class", "feature_black_star",)])
        self.render.text("★")
        self.render.close_last()
        self.render.close_last()

        self.render.open("span", [("class", "feature_stars",)])
        self.render.text(stars)
        self.render.close_last()

        self.render.close_last()

    def split_skill(self):

        words = self.line.split(" ")
        stars_index = len(words) - 1
        stars = words[stars_index]
        del words[stars_index]
        skill = " ".join(words)

        if stars[0] == "*":
            count = len(stars)
            stars = "★" * count
            if count < 5:
                stars += "☆" * (5 - count)

        return (skill, stars,)

    def proc_item_intro(self):

        if self.line == "":
            if self.is_intro_first_line:
                return

            self.render.close_last()
            self.is_intro_open_para = True
            return

        self.is_intro_first_line = False

        if self.is_intro_open_para:
                self.is_intro_open_para = False
                self.render.open("div", [("class", "para_intro",)])

        self.render.text(self.line)
        self.render.eol()
        return

    def proc_item_experience(self):

        if self.line == "":
            return

        if len(self.exp_features) < 3:
            self.proc_item_exp_header()
        else:
            self.proc_item_exp_body()

    def proc_item_exp_header(self):

        feat = self.proc_item_exp_header_get_type()
        text = self.proc_item_exp_header_normalize_period(feat)
        self.exp_features[feat] = (text, self.tags,)
        if len(self.exp_features) == 3:
            self.proc_item_exp_header_render()

    def proc_item_exp_header_get_type(self):

        feat = "period"

        for char in self.line:
            if char not in "1234567890-":
                feat = "role"

        chk = self.line.lower().replace(".", "")
        for company_form in ("kft", "rt", "llc", "ltd"):
            if (" " + company_form) in chk:
                feat = "company"
                break

        return feat

    def proc_item_exp_header_normalize_period(self, feat):

        text = self.line

        if feat == "period":
            text = text.replace("-", "&nbsp;&ndash;<br/>&ndash;&nbsp;")

        if feat == "company":
            text = "&nbsp;&ndash;&nbsp;" + text

        return text

    def proc_item_exp_header_render(self):

        self.render.open("table", [("class", "exp_table",)])
        self.render.open("tr", [("class", "exp_tr",)])
        self.render.open("td", [("class", "exp_td_left",)])
        self.proc_item_ex_header_render_field("period")
        self.render.close_last()

        self.render.open("td", [("class", "exp_td_right",)])
        self.render.open("div", [("class", "exp_heading",)])
        self.proc_item_ex_header_render_field("role", no_eol=True)
        self.proc_item_ex_header_render_field("company")
        self.render.close_last()
        self.is_exp_close_needed = True

    def proc_item_ex_header_render_field(self, field, no_eol=False):

        (text, tags,) = self.exp_features[field]
        self.render.open_field("span", field, tags)
        self.render.text(text)
        self.render.close_last(no_eol=no_eol)

    def close_exp_ul_if_needed(self):

        if not self.is_ul_close_needed:
            return
        self.is_ul_close_needed = False

        self.render.close_last()

    def close_exp_header_if_needed(self):

        if not self.is_exp_close_needed:
            return
        self.is_exp_close_needed = False

        for i in range(3):
            self.render.close_last()

    def proc_item_exp_body(self):

        text = self.line
        text = text.replace("[", "<span class=\"lang\">")
        text = text.replace("]", "</span>")

        node = "div"
        tag = "expitem"
        if text[0] == "*":
            text = text[1:].strip()
            node = "li"
            tag = "expbullet"
            if not self.is_ul_close_needed:
                self.is_ul_close_needed = True
                self.render.open("ul", [("class", "exp_ul",)])

        self.render.open_field(node, tag, self.tags)
        self.render.text(text)
        self.render.eol()
        self.render.close_last()

if __name__ == "__main__":
    Gen().main()
