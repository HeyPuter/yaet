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

## The `web-terminal` commands

### `write-srcdoc`

This command will make YAET render HTML contents starting at
the current row, or the next row when the cursor is not at
column `0`. The HTML contents will be rendered with the
full width of the terminal, and an undefined height that will
not change after the page is rendered.

```sh
echo -e "\x1B]21337;web-terminal;write-srcdoc;<!DOCTYPE><html></html>\x1B\\"
```
