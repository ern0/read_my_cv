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

    def node_open(self, node_type, section_type, class_list = None):

        self.nodes[self.level] = node_type

        self.text("<")
        self.text(node_type)

        self.text(" class=")
        self.text('"')
        self.text(section_type)
        if class_list is not None:
            for cls in class_list:
                self.text(" ")
                self.text(cls)
        self.text('"')

        self.text(">")
        if node_type == "div":
            self.eol()

        self.indent()

    def node_close(self):

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
                tags[index] = "tag_" + tags[index]
        self.line = tags[0]
        del tags[0]

        return tags

    def process(self):

        for self.line in self.file:
            self.line = self.line.strip()
            if self.line == "":
                continue

            if self.line.startswith("----"):
                self.proc_section_header()
            else:
                self.proc_section_body()

        self.render.node_close()

    def proc_section_header(self):

        self.line = self.line.replace("----","").strip()
        self.section_tags = self.parse_tags()
        self.section_type = self.line

        if self.is_first_section:
            self.is_first_section = False
        else:
            self.render.node_close()
        self.render.node_open("div", "section_" + self.section_type, self.section_tags)

        self.is_first_line = True

    def proc_section_body(self):

        self.tags = self.parse_tags()

        if self.section_type == "title":
            self.proc_title()
        else:
            self.render.text(self.line)
            self.render.eol()

        self.is_first_line = False

    def proc_title(self):

        if self.is_first_line:
            self.render.node_open("div", "name", self.tags)
        else:
            self.render.node_open("div", "position", self.tags)

        self.render.text(self.line)
        self.render.eol()
        self.render.node_close()

if __name__ == "__main__":
    Gen().main()
