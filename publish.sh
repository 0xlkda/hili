#!/bin/sh

zip -r hili.zip ./ -x ".git*" ".vite/*" "publish.sh" "index.html"
