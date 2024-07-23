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

### ⚠️ Security Implications

This application is **experimental** and you should only use it with scripts and programs
that you trust. While the security mechanisms in Chromium will prevent the iframe from
doing anything crazy of its own accord, it's important to be mindful of
**click-jacking**, **tracking the client**, and any **vulnerabilities** that might be
discovered in the future.

- See [Security.md](./doc/Security.md) for more information.

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

<br>

### 🌐 Similar Projects

- [DomTerm](https://domterm.org/Wire-byte-protocol.html)
  can also render HTML via [an escape sequence](https://domterm.org/Wire-byte-protocol.html).
  This terminal emulator is more mature than YAET, so if you're looking for a daily driver
  this might be a better choice.
