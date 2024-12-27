#!/bin/sh

zip -r hili.zip ./ -x ".git*" ".vite/*" ".prettierrc" "publish.sh" "index.html"
