#!/bin/bash
clear

./cvgen.py ern0.cv > cv.html

wkhtmltopdf \
    -q \
    --enable-local-file-access \
    --enable-javascript \
    --debug-javascript \
    --javascript-delay 1000 \
    \
    --page-size A4 \
    --zoom 0.65 \
    \
    cv.html cv.pdf

open cv.pdf
