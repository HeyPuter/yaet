# Configuration

## Location

### Configuration Directory

- `%APPDATA%` on Windows
- `$XDG_CONFIG_HOME` or `~/.config` on Linux
- `~/Library/Application Support` on macOS

### Configuration File

Configuration can be in any supported format you'd like to use.
You may create any of the following files in the Configuration Directory:
- `config.json`
- `config.json5`
- `config.yaml`
- `config.yml`
- `config.toml`

If more than one if these exist, the first one recognized will be used and
the others will be ignored. The order in which these files are recognized
is undefined.

## Parameters

- `no_tray` - if true, disable the tray icon
- `no_version` - if true, do not print version information in new terminals

## Example

**config.json**
```json
{
    "no_tray": true,
    "no_version": true
}
```
