from pydantic import BaseModel


class DrsUpdateInput(BaseModel):
    hasPrepaidFunds: bool | None = None
    hasCertifiedLeadElectrician: bool | None = None
    solarApartmentCapacityFitVerified: bool | None = None
    apartmentAtsMeterMappingVerified: bool | None = None
    atsKplcSwitchingVerified: bool | None = None
    ownerPermissionsComplete: bool | None = None
    hasVerifiedSupplierQuote: bool | None = None
    monitoringConnectivityResolved: bool | None = None
    settlementDataTrusted: bool | None = None
