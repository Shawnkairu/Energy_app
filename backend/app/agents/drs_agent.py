def assess_drs_from_project(projected: dict) -> dict:
    drs = projected["drs"]
    return {"score": drs["score"], "decision": drs["decision"], "analysis": "Pilot deterministic DRS assessment; Anthropic tool-use integration slots in here.", "recommendations": drs["reasons"] or ["Maintain prepaid coverage", "Keep deployment evidence current"], "toolCallsMade": ["get_building_data", "calculate_drs"]}
