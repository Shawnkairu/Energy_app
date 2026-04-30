# Deployment Readiness Score

DRS gates deployment, capital release, supplier lock, installer scheduling, and go-live activation.

## Formula

`DRS = 0.35(Demand) + 0.20(Prepaid) + 0.15(Load Profile) + 0.10(Installation) + 0.10(Installer/Labor) + 0.10(Capital)`

## Components

- Demand Coverage: 35%
- Prepaid Commitment: 20%
- Load Profile Quality: 15%
- Installation Readiness: 10%
- Installer/Labor Readiness: 10%
- Capital Alignment: 10%

## Thresholds

- `80-100`: approve
- `65-79`: review
- `<65`: block

## Kill Switches

- Demand below 60% blocks deployment.
- No prepaid funds blocks deployment.
- No certified lead electrician blocks deployment.
- Meter/inverter mismatch blocks deployment.
- Incomplete building owner permission blocks deployment.
- Missing critical supplier quote/BOM blocks deployment.
- Unresolved monitoring connectivity blocks deployment.
- Untrusted settlement data blocks go-live.