#!/usr/bin/env python3

import sys


class Render:

    def __init__(self):
        self.level = 0
        self.nodes = {}

    def indent(self):
        self.level += 1

    def undent(self):
        self.level -= 1

    def render(self, text):
        print("  " * self.level, end="")
        print(text, end="")

    def render_eol(self):
        self.render("\n")

    def node_open(self, node_type, section_type, tag_list):

        self.nodes[self.level] = node_type

        self.render("<")
        self.render(node_type)

        self.render(" class=")
        self.render('"')
        self.render(section_type)
        for tag in tag_list:
            self.render(" ")
            self.render(tag)
        self.render('"')

        self.render(">")
        if node_type == "div":
            self.render_eol()

        self.indent()

    def node_close(self):

        self.undent()

        self.render("</")
        self.render(self.nodes[self.level])
        self.render(">")
        self.render_eol()


class Gen:

    def __init__(self):
        self.is_first_section = True

    def main(self):

        self.open_file()
        self.render = Render()
        self.load()
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
        self.line = tags[0]
        del tags[0]

        return tags

    def load(self):

        for self.line in self.file:
            self.line = self.line.strip()
            if self.line == "":
                continue

            if self.line.startswith("----"):
                self.load_section_header()
            else:
                self.load_section_body()

        self.render.node_close()

    def load_section_header(self):

        self.line = self.line.replace("----","").strip()
        section_tags = self.parse_tags()
        section_type = self.line

        if self.is_first_section:
            self.is_first_section = False
        else:
            self.render.node_close()
        self.render.node_open("div", section_type, section_tags)

    def load_section_body(self):

        return
        tags = self.parse_tags()

        if not self.section_type in self.raw:
            self.raw[self.section_type] = {}
        if not "lines" in self.raw[self.section_type]:
            self.raw[self.section_type]["lines"] = {}

        index = len(self.raw[self.section_type]["lines"])

        self.raw[self.section_type]["lines"][index] = {}
        self.raw[self.section_type]["lines"][index]["data"] = self.line
        self.raw[self.section_type]["lines"][index]["tags"] = {}
        for tag in tags:
            self.raw[self.section_type]["lines"][index]["tags"][tag] = None

if __name__ == "__main__":
    Gen().main()
