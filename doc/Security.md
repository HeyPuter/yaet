# Security Considerations

## Network

When connecting to a remote server via terminal, you normally expect all
communication to occur through the connection. When iframes are loaded into
a terminal this is not necessarily the case, which can allow tracking that is
otherwise not possible. For example, consider a server you've connected
through via a tunnel using an iframe to obtain your real IP address.

# Security Mechanisms in YAET

## postMessage API

### Enabled on `srcdoc` only

Only iframes displayed using the `write-srcdoc` command can use the postMessage API.
Any iframe rendered with `src` might directly display a third-party website, and
this is deemed too dangerous.

A `srcdoc` iframe is able to render its own nested iframe with a `src` attribute.
In this way, the website in the nested iframe can't communicate with the postMessage
API unless the intermediate `srcdoc` iframe explicitly passes the message up to its
own parent.

### Text sent via `write-stdin` command

The `write-stdin` command in the postMessage API only accepts only characters
in the visible ASCII range. The text is then wrapped in an OSC sequence to
prevent a readline prompt from interpreting it.

### The `detach-all` command

The `webterminal;detach-all` command (see [message.sh](../examples/message.sh))
does the following to all previous iframes:
- disable pointer events
- disable the postMessage API
