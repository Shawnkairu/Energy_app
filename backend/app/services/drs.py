def clamp_score(value: float) -> float:
    return max(0, min(100, value))


def calculate_drs(input: dict) -> dict:
    components = {"demandCoverage": clamp_score(input["demandCoverage"]), "prepaidCommitment": clamp_score(input["prepaidCommitment"]), "loadProfile": clamp_score(input["loadProfile"]), "installationReadiness": clamp_score(input["installationReadiness"]), "installerReadiness": clamp_score(input["installerReadiness"]), "capitalAlignment": clamp_score(input["capitalAlignment"])}
    weighted_score = components["demandCoverage"] * 0.35 + components["prepaidCommitment"] * 0.2 + components["loadProfile"] * 0.15 + components["installationReadiness"] * 0.1 + components["installerReadiness"] * 0.1 + components["capitalAlignment"] * 0.1
    reasons = []
    if input["projectedUtilization"] < 0.6: reasons.append("Projected utilization below 60%.")
    if not input["hasPrepaidFunds"]: reasons.append("No prepaid resident commitment.")
    if not input["hasCertifiedLeadElectrician"]: reasons.append("No certified lead electrician assigned.")
    if not input["meterInverterMatchResolved"]: reasons.append("Meter/inverter mismatch unresolved.")
    if not input["ownerPermissionsComplete"]: reasons.append("Building owner permissions incomplete.")
    if not input["hasVerifiedSupplierQuote"]: reasons.append("Critical supplier quote/BOM missing.")
    if not input["monitoringConnectivityResolved"]: reasons.append("Monitoring connectivity unresolved.")
    if not input["settlementDataTrusted"]: reasons.append("Settlement data cannot be trusted.")
    score = round(weighted_score, 1)
    decision = "block" if reasons else "approve" if score >= 80 else "review" if score >= 65 else "block"
    return {"score": score, "decision": decision, "reasons": reasons, "components": components}


def get_drs_label(decision: str) -> str:
    return "Ready for deployment" if decision == "approve" else "Manual review required" if decision == "review" else "Blocked"
