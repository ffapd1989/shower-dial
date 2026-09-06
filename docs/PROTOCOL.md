*Language: **English** · [Português](PROTOCOL.pt-BR.md)*

# The Wi-Fi module's local protocol

Everything the plugin knows about the module, so nobody has to rediscover it. Worked out
by the Home Assistant community (see the README's acknowledgements) and confirmed against
a real module, firmware dated 26 Aug 2024.

## Finding it

The module takes a DHCP address and announces the hostname **`WIFI-RINNAI`**. Its MAC
starts with an Espressif prefix. When the name does not resolve, the plugin asks every
address on the local /24 for `/tela_` and keeps the one that answers like a heater.

## Requests

Plain `GET http://<ip>/<path>`. No authentication, no TLS, HTTP/1.0-style responses.
One request takes roughly 0.6 s.

| Path | Effect | Answer |
|---|---|---|
| `tela_` | Read the "screen": the fields the phone app shows | screen line |
| `bus` | Read everything, including inlet/outlet temperature and flow | bus line |
| `inc` | Press the **up** button once | screen line |
| `dec` | Press the **down** button once | screen line |
| `lig` | Toggle the heater on or off | screen line |
| `ip:<IP>:pri` | Take the priority lock for `<IP>` | malformed HTTP, but it lands |
| `ip:null:pri` | Release the lock | malformed HTTP, but it lands |
| `consumo`, `historico`, `erros` | Weekly consumption, history, error log | not used here |

## The screen line (`tela_`, and what `inc`/`dec`/`lig` return)

Comma-separated. Example: `41,0,0,175,9600,0,null:pri,5,312583,26 Ago 2024,14,0,0,255,{ 0 - 0 }`

| Field | Meaning |
|---|---|
| 0 | Power: `11` = off, `41`/`42` = on |
| 2 | `1` while water is being heated (burner on) |
| 6 | Priority: `<ip>:pri`, or `null:pri` when nobody holds it |
| 7 | Setpoint **index** (see the table below) |
| 9 | Firmware date |

## The bus line (`bus`)

Same shape, more fields. The ones that matter:

| Field | Meaning |
|---|---|
| 10 | Inlet water temperature × 100 |
| 11 | Outlet water temperature × 100 |
| 12 | Flow × 100, l/min |
| 15 | The heater's **actual** setpoint × 100 |
| 16 | The module's own IP |
| 17 | Priority, as above |
| 18 | Setpoint index, as above |
| 37 | Wi-Fi RSSI, dBm |

## Setpoint index → °C

The heater does not step by whole degrees at the top of its range:

| Index | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 16 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| °C | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 48 | 50 | 55 | 60 |

Indexes 15 and 17 do not exist.

## Timing, and the two traps

**A press takes about 3 s to land.** `inc` answers at once with the new index on the
screen line, but the heater's real setpoint (`bus` field 15) only follows ~3 s later, and a
second press inside that window is **silently dropped**. The plugin waits 3 s between
presses for that reason. There is no faster path: this is the heater, not the network.

**Priority.** While water is running, only the IP that holds the priority lock can change
the temperature; everyone else's presses are ignored. The phone app takes the lock while
it is open, and shows a red padlock to everybody else. The plugin does the same as the
app: it takes the lock in its own name before a walk, releases it after, and never
overrides a lock somebody else holds.

**HTTP caching.** Some HTTP clients cache a repeated GET to the same URL. A second `inc`
served from cache never reaches the module and returns the first answer, which looks
exactly like a dropped press. Disable caching for these requests.
