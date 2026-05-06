from app.data.demo import DEMO_PROJECTS
from app.services.energy import calculate_energy


def test_calculate_energy_matches_nyeri_typescript_baseline():
    output = calculate_energy(DEMO_PROJECTS[0]["energy"])
    assert output["E_gen"] == 2435.4
    assert output["E_direct"] == 1216.8
    assert output["E_charge"] == 722.4
    assert output["E_battery_used"] == 650.16
    assert output["E_sold"] == 1866.96
    assert output["E_waste"] == 496.2
    assert output["E_grid"] == 473.04
    assert output["utilization"] == 0.77
    assert output["coverage"] == 0.8
