"""
e.mappa Customer Simulator
Handles both regular consumers and prosumers (with solar ownership shares)
"""

import numpy as np
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class EnergyBalance:
    """Represents a customer's energy balance for an hour"""
    consumption_kwh: float
    generation_kwh: float  # For prosumers only
    net_position: float  # Positive = excess to sell, Negative = need to buy
    allocated_from_providers: Dict[str, float]  # Provider name -> kWh
    p2p_trades: List[Dict]  # List of P2P trades this hour


class Customer:
    """Base customer class"""
    
    def __init__(self, customer_id: str, customer_type: str = "residential"):
        self.customer_id = customer_id
        self.customer_type = customer_type
        self.hourly_consumption = []
        self.hourly_balance = []
        self.total_cost = 0
        self.kplc_comparison_cost = 0
        
    def generate_consumption_pattern(self) -> List[float]:
        """Generate realistic 24-hour consumption pattern"""
        consumption = []
        
        patterns = {
            "residential": {
                "morning_peak": (6, 9, 1.5),    # (start, end, peak_kw)
                "evening_peak": (18, 22, 2.0),
                "baseline": 0.3
            },
            "business": {
                "morning_peak": (8, 12, 2.5),
                "evening_peak": (14, 18, 2.0),
                "baseline": 0.2
            }
        }
        
        pattern = patterns[self.customer_type]
        
        for hour in range(24):
            power = pattern["baseline"]
            
            # Morning peak
            if pattern["morning_peak"][0] <= hour <= pattern["morning_peak"][1]:
                peak_intensity = np.sin(
                    (hour - pattern["morning_peak"][0]) / 
                    (pattern["morning_peak"][1] - pattern["morning_peak"][0]) * np.pi
                )
                power += pattern["morning_peak"][2] * peak_intensity
            
            # Evening peak
            if pattern["evening_peak"][0] <= hour <= pattern["evening_peak"][1]:
                peak_intensity = np.sin(
                    (hour - pattern["evening_peak"][0]) / 
                    (pattern["evening_peak"][1] - pattern["evening_peak"][0]) * np.pi
                )
                power += pattern["evening_peak"][2] * peak_intensity
            
            # Add randomness (±15%)
            power *= np.random.uniform(0.85, 1.15)
            consumption.append(max(0.1, power))  # Minimum 0.1 kW
        
        self.hourly_consumption = consumption
        return consumption


class Prosumer(Customer):
    """Customer who owns shares in solar farm and can generate/sell credits"""
    
    def __init__(self, customer_id: str, ownership_share_kw: float, 
                 customer_type: str = "residential"):
        super().__init__(customer_id, customer_type)
        self.ownership_share_kw = ownership_share_kw  # Their share of solar capacity
        self.hourly_generation = []
        self.total_earned = 0
        
    def generate_production_from_share(self, hour: int, 
                                       total_solar_output_kw: float,
                                       total_solar_capacity_kw: float) -> float:
        """
        Calculate how much this prosumer generates based on their ownership share
        """
        # Their % of total solar capacity
        ownership_percentage = self.ownership_share_kw / total_solar_capacity_kw
        
        # Their generation this hour
        generation = total_solar_output_kw * ownership_percentage
        
        return generation
    
    def calculate_net_position(self, hour: int) -> float:
        """
        Calculate net energy position (positive = seller, negative = buyer)
        """
        consumption = self.hourly_consumption[hour]
        generation = self.hourly_generation[hour] if self.hourly_generation else 0
        
        net = generation - consumption
        return net
    
    def has_excess_to_sell(self, hour: int, threshold_kwh: float = 0.1) -> bool:
        """Check if prosumer has excess energy to sell"""
        return self.calculate_net_position(hour) > threshold_kwh


def create_customer_base() -> Dict[str, Customer]:
    """Create the 20-customer pilot base (14 consumers + 6 prosumers)"""
    
    customers = {}
    
    # Create 14 regular consumers
    for i in range(1, 15):
        customer_id = f"consumer_{i:02d}"
        customers[customer_id] = Customer(
            customer_id=customer_id,
            customer_type="residential" if i <= 12 else "business"
        )
        customers[customer_id].generate_consumption_pattern()
    
    # Create 6 prosumers with varying ownership shares
    prosumer_shares = [4.0, 6.0, 3.0, 5.0, 4.5, 3.5]  # kW ownership
    
    for i, share in enumerate(prosumer_shares, 1):
        customer_id = f"prosumer_{i:02d}"
        customers[customer_id] = Prosumer(
            customer_id=customer_id,
            ownership_share_kw=share,
            customer_type="residential"
        )
        customers[customer_id].generate_consumption_pattern()
    
    return customers


def calculate_total_demand(customers: Dict[str, Customer], hour: int) -> float:
    """Calculate total energy demand from all customers for a specific hour"""
    return sum(c.hourly_consumption[hour] for c in customers.values())


def get_prosumers(customers: Dict[str, Customer]) -> List[Prosumer]:
    """Get list of prosumer customers only"""
    return [c for c in customers.values() if isinstance(c, Prosumer)]


def get_consumers(customers: Dict[str, Customer]) -> List[Customer]:
    """Get list of regular consumer customers only"""
    return [c for c in customers.values() if not isinstance(c, Prosumer)]


if __name__ == "__main__":
    # Test customer generation
    customers = create_customer_base()
    
    print("=" * 60)
    print("e.mappa Customer Base - 20 Homes")
    print("=" * 60)
    
    prosumers = get_prosumers(customers)
    consumers = get_consumers(customers)
    
    print(f"\nRegular Consumers: {len(consumers)}")
    print(f"Prosumers (with solar shares): {len(prosumers)}")
    
    # Show prosumer details
    print("\n" + "=" * 60)
    print("Prosumer Solar Ownership")
    print("=" * 60)
    total_prosumer_capacity = sum(p.ownership_share_kw for p in prosumers)
    
    for prosumer in prosumers:
        print(f"{prosumer.customer_id}: {prosumer.ownership_share_kw} kW share")
    
    print(f"\nTotal Prosumer Capacity: {total_prosumer_capacity} kW")
    
    # Show hourly demand pattern
    print("\n" + "=" * 60)
    print("24-Hour Total Demand Pattern")
    print("=" * 60)
    print(f"{'Hour':<6} {'Total Demand (kW)':<18} {'Peak Type'}")
    print("-" * 60)
    
    for hour in range(24):
        demand = calculate_total_demand(customers, hour)
        
        if 6 <= hour <= 9:
            peak_type = "Morning Peak"
        elif 18 <= hour <= 22:
            peak_type = "Evening Peak"
        elif 10 <= hour <= 17:
            peak_type = "Midday Low"
        else:
            peak_type = "Night Baseline"
        
        print(f"{hour:02d}:00  {demand:>12.2f} kW     {peak_type}")
    
    # Sample consumption profiles
    print("\n" + "=" * 60)
    print("Sample Customer Consumption (Peak Hours)")
    print("=" * 60)
    
    sample_customers = list(customers.values())[:5]
    for customer in sample_customers:
        morning = customer.hourly_consumption[7]
        noon = customer.hourly_consumption[12]
        evening = customer.hourly_consumption[19]
        print(f"{customer.customer_id}: "
              f"Morning={morning:.2f}kW, Noon={noon:.2f}kW, Evening={evening:.2f}kW")
