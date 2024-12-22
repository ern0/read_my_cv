#!/bin/bash
clear

./cvgen.py ern0.cv > cv.html
#exit

wkhtmltopdf \
    --enable-local-file-access \
    --enable-javascript \
    --debug-javascript \
    --javascript-delay 100 \
    --run-script "render_pdf(\"?show=web\");" \
    \
    --page-size A4 \
    --zoom 0.95 \
    \
    cv.html cv.pdf

open cv.pdf
