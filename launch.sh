#!/bin/bash
clear

./cvgen.py ern0.cv > cv.html

if [ "$1" == "" ]; then
    echo "cv.html updated, copy URL from the web app to generate PDF"
    exit
fi

wkhtmltopdf \
    --enable-local-file-access \
    --enable-javascript \
    --debug-javascript \
    --javascript-delay 100 \
    --run-script "main(\"$1\");" \
    \
    --page-size A4 \
    --zoom 0.95 \
    \
    cv.html zalka_erno-cv_2025a.pdf

open *cv*.pdf
