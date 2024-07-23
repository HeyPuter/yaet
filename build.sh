cd src/terminal
npx rollup -c rollup.config.js
cd -

rm -rf src/application/static/terminal
cp -r src/terminal/dist/ src/application/static/terminal
