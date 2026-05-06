from app.data.demo import DEMO_PROJECTS
from app.services.projector import project_building


def test_drs_blocks_karatina_for_supplier_quote():
    drs = project_building(DEMO_PROJECTS[1])["drs"]
    assert drs["decision"] == "block"
    assert "Critical supplier quote/BOM missing." in drs["reasons"]


def test_drs_approves_when_all_kill_switches_clear():
    project = {**DEMO_PROJECTS[1], "drs": {**DEMO_PROJECTS[1]["drs"], "hasVerifiedSupplierQuote": True}, "prepaidCommittedKes": 100000}
    drs = project_building(project)["drs"]
    assert drs["decision"] in {"approve", "review"}
    assert "Critical supplier quote/BOM missing." not in drs["reasons"]
