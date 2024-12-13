#!/usr/bin/env python3

import sys


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

    def open(self, node_type, attrib_list = None, single_shot = False):

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
        if node_type == "div":
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

        class_value = "section_" + section_type
        class_value += self.append_tags(tag_list)

        attr_list = [ ("class", class_value,) ]
        self.open(node_type, attr_list)

    def open_field(self, node_type, field_type, tag_list):

        class_value = "field_" + field_type
        class_value += self.append_tags(tag_list)

        attr_list = [ ("class", class_value,) ]
        self.open(node_type, attr_list)

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

    def close_last(self):

        self.undent()

        self.text("</")
        self.text(self.nodes[self.level])
        self.text(">")
        self.eol()


class Gen:

    def __init__(self):
        self.is_first_section = True

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

        for self.line in self.file:
            self.line = self.line.strip()
            if self.line == "":
                continue

            if self.line.startswith("----"):
                self.proc_header()
            else:
                self.proc_body()

        self.render.close_last()

    def proc_header(self):

        self.line = self.line.replace("----","").strip()
        self.section_tags = self.parse_tags()
        self.section_type = self.line

        if self.is_first_section:
            self.is_first_section = False
        else:
            self.render.close_last()
        self.render.open_section("div", self.section_type, self.section_tags)

        self.is_first_line = True

    def proc_body(self):

        self.tags = self.parse_tags()

        if self.section_type == "title":
            self.proc_item_title()
        elif self.section_type == "contact":
            self.proc_item_contact()
        elif self.section_type == "skills":
            self.proc_item_skills_langs()
        elif self.section_type == "languages":
            self.proc_item_skills_langs()
        elif self.section_type == "intro":
            self.proc_item_intro()

        #TODO continue

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
        self.render.text(skill)
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
        self.render.text(self.line)
        self.render.eol()
        return

if __name__ == "__main__":
    Gen().main()
