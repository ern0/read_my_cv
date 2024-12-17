#!/bin/bash
clear

./cvgen.py ern0.cv > cv.html
cat cv.html | tail -n23 | head -n 10
