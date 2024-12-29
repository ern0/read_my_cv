#!/bin/bash

target=kloud:/var/www/html/cv

rm -f .DS_Store
rm -f img/.DS_Store

scp -r cv.html $target
scp -r style.css script.js $target
#scp -r img $target

