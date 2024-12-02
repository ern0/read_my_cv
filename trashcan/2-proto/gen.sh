#/bin/bash
clear

pandoc cv.html -t latex -o test.pdf

exit
wkhtmltopdf \
        --enable-local-file-access \
        --enable-javascript \
        --debug-javascript \
        --javascript-delay 200 \
        cv.html \
        cv.pdf \

        #open cv.pdf
