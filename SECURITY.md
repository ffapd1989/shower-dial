*Language: **English** · [Português](SECURITY.pt-BR.md)*

# Security

## Reporting

Please report vulnerabilities privately through
[GitHub's private vulnerability reporting](https://github.com/ffapd1989/shower-dial/security/advisories/new)
rather than in a public issue. You will get an answer within a week.

## What to know

**The module itself has no authentication.** Anyone on your network can read the heater's
state and press its buttons over HTTP; that is how the phone app works too, and this plugin
cannot change it. Keep the module on a network you trust.

**The plugin never steals the lock.** It respects a priority lock held by another device
and only ever takes the lock in the name of the machine it runs on.

**Nothing is exposed.** The plugin opens no listening port and accepts no inbound
connections; it only makes outbound HTTP requests to the module's IP on the LAN.
