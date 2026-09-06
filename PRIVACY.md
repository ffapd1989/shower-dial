*Language: **English** · [Português](PRIVACY.pt-BR.md)*

# Privacy

Short version: this plugin has no server, collects nothing, and talks to nothing but the
heater's Wi-Fi module on your own network.

## What is stored, and where

One thing: the module's IP address, plus whether you typed it or the plugin found it, and
your interface language. All of it lives in the Stream Deck app's own settings store for
this plugin. Per key, the temperatures you chose and the label you typed are stored the
same way. Nothing is written anywhere else.

## What leaves your machine

Nothing leaves your local network. The plugin sends HTTP requests to the module's IP and
reads the answers. When it has to look for the module, it sends one small request to each
address on your local subnet, once.

There is no telemetry, no analytics, no crash reporting and no update check. No author of
this plugin sees anything about your heater, your network or your use of it.

## Logs

The Stream Deck app keeps the plugin's log files inside the plugin folder (`logs/`). They
may contain the module's IP address. They stay on your machine; delete them whenever you
like.
