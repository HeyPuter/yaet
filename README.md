<h3 align="center">YAET</h3>
<h4 align="center">Yet Another Terminal Emulator</h4>
</h3>

<hr>

### 📦 Setup

You will need to run `npm install`. You may also need to run `electron-rebuild`
within `src/application`.

```
npm install
cd src/application
npx electron-rebuild -f -w node-pty
cd -
```

You will need to run `rollup` inside `src/terminal`.

```
cd src/terminal
rollup -c rollup.config.js --watch
```

### ▶️ Run

After following the steps above, running `npm start`
inside `src/application` should launch YAET.

```
cd src/application
npm run start
```
