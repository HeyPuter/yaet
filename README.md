<h3 align="center">YAET</h3>
<h4 align="center">YAET: Another Terminal Emulator</h4>

<p align="center">
YAET is a terminal that can display web pages.
</p>

<h3 align="center"><img width="800" style="border-radius:5px;" alt="screenshot" src="https://assets.puter.site/yaet.webp"></h3>

<hr>

### ❓ What is this?

YAET is a terminal emulator built on Xterm.js and Electron.
It can interpret escape sequences that allow shell scripts and other programs to write HTML content directly to the terminal, or display content from the web.

<br>

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

<br>

### ▶️ Run

After following the steps above, running `npm start`
inside `src/application` should launch YAET.

```
cd src/application
npm run start
```

<br>


### 📚 Docs

- [Configuring YAET](./doc/Configuration.md)
- [YAET OSC Extensions](./doc/OSC.md)
