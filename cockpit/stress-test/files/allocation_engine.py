"""
e.mappa Allocation Engine
Optimally distributes power from multiple providers to customers
Based on price, reliability, capacity, and customer preferences
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
import numpy as np

@dataclass
class AllocationResult:
    """Result of allocation optimization for one hour"""
    hour: int
    customer_allocations: Dict[str, Dict[str, float]]  # customer_id -> {provider: kwh}
    provider_utilization: Dict[str, float]  # provider -> % utilized
    weighted_avg_price: float
    total_allocated: float
    unmet_demand: float


class AllocationEngine:
    """
    e.mappa's core allocation engine
    Distributes provider power to customers optimally
    """
    
    def __init__(self, platform_markup: float = 2.0):
        """
        Args:
            platform_markup: KES per kWh that e.mappa adds (default 2.0)
        """
        self.platform_markup = platform_markup
        self.allocation_history = []
        
    def allocate_hour(self, 
                     hour: int,
                     providers: List,  # List of SolarProvider objects
                     customers: Dict,  # Dict of Customer objects
                     customer_preferences: Dict = None) -> AllocationResult:
        """
        Allocate power for a single hour using optimization algorithm
        
        Strategy:
        1. Calculate total demand
        2. Sort providers by score (price, reliability, capacity)
        3. Allocate greedily with fairness constraints
        4. Ensure no provider over-allocated
        """
        
        # Get available capacity and prices
        provider_capacity = {
            p.name: p.get_available_capacity(hour) for p in providers
        }
        provider_prices = {
            p.name: p.get_price(hour) for p in providers
        }
        provider_reliability = {
            p.name: p.reliability for p in providers
        }
        
        # Calculate customer demands
        customer_demands = {
            cid: customer.hourly_consumption[hour] 
            for cid, customer in customers.items()
        }
        
        total_demand = sum(customer_demands.values())
        total_supply = sum(provider_capacity.values())
        
        # Initialize allocations
        allocations = {cid: {} for cid in customers.keys()}
        remaining_capacity = provider_capacity.copy()
        remaining_demand = customer_demands.copy()
        
        # Allocation strategy: Multi-criteria scoring
        # Score = (1 / normalized_price) * reliability_weight * capacity_weight
        
        def calculate_provider_score(provider_name: str, hour: int) -> float:
            """Calculate composite score for provider"""
            price = provider_prices[provider_name]
            reliability = provider_reliability[provider_name]
            capacity_ratio = provider_capacity[provider_name] / total_supply if total_supply > 0 else 0
            
            # Normalize price (lower is better)
            price_score = 1.0 / (price / 20.0)  # Normalized around KES 20
            
            # Weight factors
            PRICE_WEIGHT = 0.5
            RELIABILITY_WEIGHT = 0.3
            CAPACITY_WEIGHT = 0.2
            
            score = (price_score * PRICE_WEIGHT + 
                    reliability * RELIABILITY_WEIGHT + 
                    capacity_ratio * CAPACITY_WEIGHT)
            
            return score
        
        # Sort providers by score (highest first)
        provider_scores = {
            p.name: calculate_provider_score(p.name, hour) 
            for p in providers
        }
        sorted_providers = sorted(
            provider_scores.keys(), 
            key=lambda p: provider_scores[p], 
            reverse=True
        )
        
        # Allocate to customers
        for customer_id in customers.keys():
            if remaining_demand[customer_id] <= 0:
                continue
                
            customer_need = remaining_demand[customer_id]
            
            # Allocate from providers in order of score
            for provider_name in sorted_providers:
                if remaining_capacity[provider_name] <= 0:
                    continue
                
                # Allocate min(customer need, provider capacity)
                allocation_amount = min(
                    customer_need,
                    remaining_capacity[provider_name]
                )
                
                if allocation_amount > 0:
                    allocations[customer_id][provider_name] = allocation_amount
                    remaining_capacity[provider_name] -= allocation_amount
                    customer_need -= allocation_amount
                    
                    if customer_need <= 0:
                        break
            
            remaining_demand[customer_id] = max(0, customer_need)
        
        # Calculate metrics
        total_allocated = sum(
            sum(alloc.values()) for alloc in allocations.values()
        )
        unmet_demand = sum(remaining_demand.values())
        
        provider_utilization = {
            name: ((provider_capacity[name] - remaining_capacity[name]) / 
                   provider_capacity[name] * 100) if provider_capacity[name] > 0 else 0
            for name in provider_capacity.keys()
        }
        
        # Calculate weighted average price
        total_cost = 0
        for customer_id, customer_alloc in allocations.items():
            for provider_name, kwh in customer_alloc.items():
                total_cost += kwh * provider_prices[provider_name]
        
        weighted_avg_price = total_cost / total_allocated if total_allocated > 0 else 0
        
        result = AllocationResult(
            hour=hour,
            customer_allocations=allocations,
            provider_utilization=provider_utilization,
            weighted_avg_price=weighted_avg_price,
            total_allocated=total_allocated,
            unmet_demand=unmet_demand
        )
        
        self.allocation_history.append(result)
        return result
    
    def calculate_customer_cost(self, 
                                customer_id: str, 
                                allocation: Dict[str, float],
                                provider_prices: Dict[str, float]) -> float:
        """Calculate total cost for a customer including platform markup"""
        
        provider_cost = sum(
            kwh * provider_prices[provider_name]
            for provider_name, kwh in allocation.items()
        )
        
        total_kwh = sum(allocation.values())
        platform_fee = total_kwh * self.platform_markup
        
        return provider_cost + platform_fee
    
    def get_kplc_comparison_cost(self, kwh: float, hour: int) -> float:
        """Calculate what KPLC would charge for same energy"""
        # KPLC average rate: KES 30/kWh
        # Peak hours (6-9, 18-22): KES 35/kWh
        # Off-peak: KES 28/kWh
        
        if hour in [6, 7, 8, 9, 18, 19, 20, 21, 22]:
            rate = 35.0
        else:
            rate = 28.0
        
        return kwh * rate


def run_allocation_analysis(providers: List, customers: Dict, 
                           hour_start: int = 0, hour_end: int = 24) -> List[AllocationResult]:
    """Run allocation for multiple hours and return results"""
    
    engine = AllocationEngine(platform_markup=2.0)
    results = []
    
    for hour in range(hour_start, hour_end):
        result = engine.allocate_hour(hour, providers, customers)
        results.append(result)
    
    return results


if __name__ == "__main__":
    # Test allocation engine
    import sys
    sys.path.append('/home/claude/emappa_simulation')
    
    from solar_generation import create_provider_fleet
    from customers import create_customer_base
    
    print("=" * 60)
    print("e.mappa Allocation Engine Test")
    print("=" * 60)
    
    # Create providers and customers
    providers = create_provider_fleet()
    customers = create_customer_base()
    
    # Run allocation for key hours
    engine = AllocationEngine(platform_markup=2.0)
    test_hours = [7, 12, 19]  # Morning, noon, evening
    
    for hour in test_hours:
        print(f"\n{'=' * 60}")
        print(f"Hour {hour}:00 - Allocation Results")
        print(f"{'=' * 60}")
        
        result = engine.allocate_hour(hour, providers, customers)
        
        print(f"\nTotal Demand: {sum(c.hourly_consumption[hour] for c in customers.values()):.2f} kW")
        print(f"Total Allocated: {result.total_allocated:.2f} kW")
        print(f"Unmet Demand: {result.unmet_demand:.2f} kW")
        print(f"Weighted Avg Price (providers): KES {result.weighted_avg_price:.2f}/kWh")
        print(f"Customer Price (with markup): KES {result.weighted_avg_price + engine.platform_markup:.2f}/kWh")
        
        print(f"\nProvider Utilization:")
        for provider, util in result.provider_utilization.items():
            print(f"  {provider}: {util:.1f}%")
        
        # Sample customer allocation
        print(f"\nSample Customer Allocations:")
        sample_customers = list(result.customer_allocations.keys())[:3]
        for cid in sample_customers:
            alloc = result.customer_allocations[cid]
            print(f"  {cid}:")
            for provider, kwh in alloc.items():
                print(f"    {provider}: {kwh:.3f} kWh")
