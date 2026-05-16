# Energy Formulas

Implementation: `packages/shared/src/energy.ts`. Settlement uses **E_sold only** — see [SETTLEMENT_AND_PAYBACK.md](./SETTLEMENT_AND_PAYBACK.md).

## Inputs

- `P_solar` — array kW
- `H_sun` — peak sun hours / day
- `eta_system` — system efficiency (inverter, soiling, etc.)
- `Days` — period length
- `D_day`, `D_night`, `D_total` — demand (kWh)
- `C_battery_usable` — usable battery capacity (kWh)
- `eta_battery` — round-trip efficiency

## Core equations

```
E_gen         = P_solar × H_sun × eta_system × Days

E_direct      = min(E_gen, D_day)
E_charge      = min(E_gen - E_direct, C_battery_usable)
E_battery_used = min(E_charge × eta_battery, D_night)

E_sold        = E_direct + E_battery_used   ← settlement base
E_waste       = E_gen - E_direct - E_charge
E_grid        = D_total - E_sold

utilization   = E_sold / E_gen   (0 if E_gen = 0)
wasteRate     = E_waste / E_gen  (0 if E_gen = 0)
coverage      = E_sold / D_total (0 if D_total = 0)
```

## Safety clamps

- `E_sold` never exceeds `E_gen` or `D_total`.
- All divisions guard zero denominators.
- Untrusted or missing meter data should **pause settlement** or use conservative rules (`dataQuality` on readings).

## What does not pay

Generated, wasted, curtailed, unpaid, or unverified kWh do **not** create stakeholder payout. Pledges are demand signals only — not monetized energy.
