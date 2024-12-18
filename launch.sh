#!/bin/bash
clear

./cvgen.py ern0.cv > cv.html

wkhtmltopdf \
    --enable-local-file-access \
    --enable-javascript \
    --debug-javascript \
    --javascript-delay 100 \
    --run-script "hide_sidepanel();" \
    \
    --page-size A4 \
    --zoom 0.65 \
    \
    cv.html cv.pdf

open cv.pdf
