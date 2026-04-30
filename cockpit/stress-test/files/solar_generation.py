"""
e.mappa Solar Generation Simulator
Generates realistic 24-hour solar production curves for multiple providers
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List

class SolarProvider:
    """Represents a solar provider with specific capacity and characteristics"""
    
    def __init__(self, name: str, capacity_kw: float, base_price: float, 
                 reliability: float, location: str = "nyeri"):
        self.name = name
        self.capacity_kw = capacity_kw
        self.base_price = base_price  # KES per kWh
        self.reliability = reliability  # 0-1 (e.g., 0.85 = 85%)
        self.location = location
        self.hourly_generation = []
        self.hourly_prices = []
        
    def generate_production_curve(self, date: datetime) -> List[float]:
        """
        Generate realistic 24-hour solar production curve
        Based on Nyeri, Kenya solar irradiance patterns
        """
        hours = range(24)
        production = []
        
        # Nyeri gets ~5.5 kWh/m²/day average
        # Performance ratio: 78% (accounting for real-world losses)
        PERFORMANCE_RATIO = 0.78
        
        for hour in hours:
            if 6 <= hour <= 18:  # Daylight hours in Kenya (6:30 AM - 6:30 PM)
                # Sine wave centered at solar noon (12:30 PM)
                normalized_hour = (hour - 6) / 12  # 0 to 1 through the day
                solar_intensity = np.sin(normalized_hour * np.pi)  # Peak at noon
                
                # Cloud factor varies by provider reliability
                # More reliable providers have better weather forecasting/redundancy
                cloud_variance = 1.0 - (self.reliability * 0.3)  # 70-100% range
                cloud_factor = np.random.uniform(cloud_variance, 1.0)
                
                # Calculate actual power output
                power_kw = (self.capacity_kw * solar_intensity * 
                           PERFORMANCE_RATIO * cloud_factor)
                production.append(max(0, power_kw))
            else:
                production.append(0)  # No production at night
        
        self.hourly_generation = production
        return production
    
    def generate_dynamic_pricing(self) -> List[float]:
        """
        Generate hour-by-hour pricing based on supply/demand
        Providers charge more during peak demand (evening)
        """
        prices = []
        
        for hour in range(24):
            # Base price varies by time of day
            if 6 <= hour <= 9:  # Morning peak
                multiplier = 1.2
            elif 18 <= hour <= 22:  # Evening peak (highest demand)
                multiplier = 1.4
            elif 10 <= hour <= 17:  # Midday (excess solar)
                multiplier = 0.9
            else:  # Night (low solar, moderate demand)
                multiplier = 1.1
            
            # Provider reliability affects pricing confidence
            reliability_discount = (1 - self.reliability) * 0.1
            
            hour_price = self.base_price * multiplier * (1 + reliability_discount)
            prices.append(round(hour_price, 2))
        
        self.hourly_prices = prices
        return prices
    
    def get_available_capacity(self, hour: int) -> float:
        """Get available capacity for a specific hour"""
        if not self.hourly_generation:
            raise ValueError("Must generate production curve first")
        return self.hourly_generation[hour]
    
    def get_price(self, hour: int) -> float:
        """Get price for a specific hour"""
        if not self.hourly_prices:
            raise ValueError("Must generate pricing first")
        return self.hourly_prices[hour]


def create_provider_fleet() -> List[SolarProvider]:
    """Create the 3 solar providers for e.mappa pilot"""
    
    providers = [
        SolarProvider(
            name="Provider A - SolarTech",
            capacity_kw=30.0,
            base_price=18.0,  # KES/kWh
            reliability=0.85
        ),
        SolarProvider(
            name="Provider B - GreenPower",
            capacity_kw=40.0,
            base_price=20.0,
            reliability=0.95
        ),
        SolarProvider(
            name="Provider C - EcoEnergy",
            capacity_kw=25.0,
            base_price=16.0,
            reliability=0.75
        )
    ]
    
    # Generate production curves and pricing for all providers
    today = datetime.now()
    for provider in providers:
        provider.generate_production_curve(today)
        provider.generate_dynamic_pricing()
    
    return providers


def get_total_available_power(providers: List[SolarProvider], hour: int) -> float:
    """Calculate total power available from all providers at a given hour"""
    return sum(p.get_available_capacity(hour) for p in providers)


def get_weighted_average_price(providers: List[SolarProvider], hour: int) -> float:
    """Calculate capacity-weighted average price across all providers"""
    total_capacity = sum(p.get_available_capacity(hour) for p in providers)
    
    if total_capacity == 0:
        return 0
    
    weighted_sum = sum(
        p.get_available_capacity(hour) * p.get_price(hour) 
        for p in providers
    )
    
    return weighted_sum / total_capacity


if __name__ == "__main__":
    # Test the provider generation
    providers = create_provider_fleet()
    
    print("=" * 60)
    print("e.mappa Solar Provider Fleet - 24-Hour Simulation")
    print("=" * 60)
    
    for provider in providers:
        print(f"\n{provider.name}")
        print(f"  Capacity: {provider.capacity_kw} kW")
        print(f"  Base Price: KES {provider.base_price}/kWh")
        print(f"  Reliability: {provider.reliability * 100}%")
        
        # Show peak production
        peak_hour = 12
        print(f"  Peak Production (noon): {provider.get_available_capacity(peak_hour):.2f} kW")
        print(f"  Peak Price (evening): KES {provider.get_price(19):.2f}/kWh")
    
    # Show hourly summary
    print("\n" + "=" * 60)
    print("Hourly Summary")
    print("=" * 60)
    print(f"{'Hour':<6} {'Total kW':<12} {'Avg Price':<12} {'Status'}")
    print("-" * 60)
    
    for hour in range(24):
        total_kw = get_total_available_power(providers, hour)
        avg_price = get_weighted_average_price(providers, hour)
        
        if hour < 6 or hour > 18:
            status = "Night - Low Solar"
        elif 10 <= hour <= 16:
            status = "Peak Solar"
        elif hour in [6, 7, 8, 9, 18, 19, 20, 21]:
            status = "High Demand"
        else:
            status = "Normal"
        
        print(f"{hour:02d}:00  {total_kw:>8.2f} kW  KES {avg_price:>6.2f}   {status}")
