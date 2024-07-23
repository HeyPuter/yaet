# YAET postMessage API

## Where it Works

The postMessage API is only available on iframes created via `write-srcdoc`.
It will not work on iframes created via `write-src`.

## Format

Each message should be of the following form:

```js
{
    ...command_arguments,
    command: 'some-command',
}
```

## Commands

### `write-stdin`

This command will write charactters in the visible ASCII range to stdin,
wrapped between `\x1B]21337;` and `\x1B\\`.
