# Electron Terminal

## Installation
```
npm install
cd src/application
npx electron-rebuild -f -w node-pty
cd -
```

## Development Setup
in a new terminal window:
```
cd src/terminal
rollup -c rollup.config.js --watch
```

## Run

### Start the daemon
```
cd src/application
npm run start
```

### Open a terminal window
```
cd src/cli
node main term
```
