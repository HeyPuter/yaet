# YAET OSC Extensions

## The `21337` OSC Sequences

**YAET**-specific features use OSC codes beginning with `21337;web-terminal;`,

```
<ESC>]21337;web-terminal;<command>;<data><ESC>\
```

In this way **YAET** does not reserve the entire space of OSC
sequences with the function identifier `21337`.
This leaves room for other projects to use a similar
convention provided they replace `web-terminal` with
some other string.

### Command Attributes

Commands for **YAET** can take attributes using the same format
as URL querystring parameters. This format was chosen because
it doesn't conflict with the `;` delimiter (encode as `%3B`)
and the format is well-defined.

```
<ESC>]21337;web-terminal;example?somekey=somevalue;<data><ESC>\
```

## The `web-terminal` commands

### `write-srcdoc`

This command will make YAET render HTML contents starting at
the current row, or the next row when the cursor is not at
column `0`. The HTML contents will be rendered with the
full width of the terminal. If a height is not specified, the
resulting height is undefined but guarenteed to be at least one
row in height.

| Parameter  | Description |
| ---------- | ----------- |
| `height`   | height of frame in pixels |
| `encoding` | set this to `base64` to transmit a base64 string |

#### Example without parameters

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc;<!DOCTYPE><html></html>\x1B\\"
```

#### Example with height parameter

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc?height=50;<!DOCTYPE><html></html>\x1B\\"
```

#### Example with `base64` encoding

**YAET** uses [xtermjs](https://github.com/xtermjs/xterm.js),
so OSC sequence parsing supports unicode characters. However, for full compatability
with other terminal emulators it is best to transmit unicode strings as base64.

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc?encoding=base64;PCFET0NUWVBFPjxodG1sPjwvaHRtbD4=\x1B\\"
```

### `write-src`

This command will make YAET render an iframe displaying the specified
page, following the same rendering rules as `write-srcdoc`.

| Parameter  | Description |
| ---------- | ----------- |
| `height`   | height of frame in pixels |

#### Example

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc;https://example.com\x1B\\"
```
### `detach-all`

This command will disable pointer events and the postMessage API on all
previous iframes.

| Parameter  | Description |
| ---------- | ----------- |
| `height`   | height of frame in pixels |

#### Example

```sh
echo -e "\x1B]21337;web-terminal;detach-all\x1B\\"
```
