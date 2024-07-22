# YAET OSC Extensions

## The `21337` OSC Sequences

YAET interprets OSC codes beginning with `21337;web-terminal;`,

```
<ESC>]21337;web-terminal;<command>;<data><ESC>\
```

In this way **YAET** does not reserve the entire space of OSC
sequences beginning with `21337`, so feel free to use the
same identifier in your own projects following this
convention: `<ESC>]21337;<domain>;...<ESC>\`.

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

#### Example without parameters

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc;<!DOCTYPE><html></html>\x1B\\"
```

#### Example with height parameter

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc?height=50;<!DOCTYPE><html></html>\x1B\\"
```
