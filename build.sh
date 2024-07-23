cd src/xterm-addon-webview
npx tsc
cd -

cd src/terminal
npx rollup -c rollup.config.js
cd -

rm -rf src/yaet/static/terminal
cp -r src/terminal/dist/ src/yaet/static/terminal
