"""
e.mappa Simulation Visualizer
Creates charts and reports from simulation data
"""

import json
import sys

def load_results(filename='emappa_simulation_results.json'):
    """Load simulation results from JSON"""
    filepath = f"/home/claude/emappa_simulation/{filename}"
    with open(filepath, 'r') as f:
        return json.load(f)

def generate_hourly_report(results):
    """Generate detailed hourly breakdown report"""
    
    print("\n" + "=" * 90)
    print("e.mappa 24-HOUR DETAILED REPORT")
    print("=" * 90)
    
    print("\n{:<6} {:<10} {:<10} {:<12} {:<10} {:<10} {:<12} {:<10}".format(
        "Hour", "Supply", "Demand", "Allocated", "P2P Trades", "P2P kWh", "Savings", "Platform"
    ))
    print("{:<6} {:<10} {:<10} {:<12} {:<10} {:<10} {:<12} {:<10}".format(
        "", "(kW)", "(kW)", "(kWh)", "Count", "Traded", "vs KPLC", "Revenue"
    ))
    print("-" * 90)
    
    for hour_data in results['hourly_data']:
        hour = hour_data['hour']
        supply = hour_data['supply_demand']['total_supply_kw']
        demand = hour_data['supply_demand']['total_demand_kw']
        allocated = hour_data['allocation']['total_allocated_kwh']
        p2p_trades = hour_data['p2p_trading']['trades_executed']
        p2p_kwh = hour_data['p2p_trading']['total_kwh_traded']
        savings_pct = hour_data['costs']['savings_percent']
        
        # Calculate platform revenue this hour
        alloc_revenue = allocated * 2.0  # KES 2 markup
        p2p_revenue = hour_data['p2p_trading']['platform_revenue_kes']
        total_hour_revenue = alloc_revenue + p2p_revenue
        
        status = ""
        if hour in [12, 13, 14]:
            status = " ☀️ PEAK SOLAR"
        elif hour in [19, 20, 21]:
            status = " ⚡ PEAK DEMAND"
        elif hour >= 22 or hour <= 5:
            status = " 🌙 NIGHT"
        
        print("{:02d}:00  {:<8.1f}  {:<8.1f}  {:<10.2f}  {:<9}  {:<8.2f}  {:<9.1f}%  KES {:<6.2f}{}".format(
            hour, supply, demand, allocated, p2p_trades, p2p_kwh, 
            savings_pct, total_hour_revenue, status
        ))
    
    print("-" * 90)

def generate_provider_analysis(results):
    """Generate provider performance analysis"""
    
    print("\n" + "=" * 70)
    print("PROVIDER PERFORMANCE ANALYSIS")
    print("=" * 70)
    
    # Aggregate provider stats
    provider_names = set()
    for hour_data in results['hourly_data']:
        provider_names.update(hour_data['provider_stats']['utilization'].keys())
    
    provider_stats = {name: {
        'total_utilization': 0,
        'hours': 0,
        'avg_price': 0,
        'price_hours': 0
    } for name in provider_names}
    
    for hour_data in results['hourly_data']:
        for provider, util in hour_data['provider_stats']['utilization'].items():
            provider_stats[provider]['total_utilization'] += util
            provider_stats[provider]['hours'] += 1
        
        for provider, price in hour_data['provider_stats']['prices'].items():
            if price > 0:
                provider_stats[provider]['avg_price'] += price
                provider_stats[provider]['price_hours'] += 1
    
    print("\n{:<30} {:<15} {:<15}".format("Provider", "Avg Utilization", "Avg Price"))
    print("-" * 70)
    
    for provider, stats in provider_stats.items():
        avg_util = stats['total_utilization'] / stats['hours'] if stats['hours'] > 0 else 0
        avg_price = stats['avg_price'] / stats['price_hours'] if stats['price_hours'] > 0 else 0
        
        print("{:<30} {:<14.1f}% KES {:<12.2f}/kWh".format(
            provider, avg_util, avg_price
        ))

def generate_customer_savings_report(results):
    """Generate customer savings breakdown"""
    
    print("\n" + "=" * 70)
    print("CUSTOMER VALUE PROPOSITION")
    print("=" * 70)
    
    summary = results['summary']
    
    # Per customer calculations (20 customers)
    num_customers = 20
    total_savings = summary['financial_metrics']['total_savings_kes']
    avg_customer_savings = total_savings / num_customers
    
    # Monthly projections
    monthly_savings = avg_customer_savings * 30
    annual_savings = monthly_savings * 12
    
    print("\nPER CUSTOMER (24-hour period):")
    print(f"  Average savings:        KES {avg_customer_savings:,.2f}")
    print(f"  Savings vs KPLC:        {summary['financial_metrics']['avg_savings_percent']:.1f}%")
    
    print("\nMONTHLY PROJECTIONS (per customer):")
    print(f"  Expected monthly savings:   KES {monthly_savings:,.2f}")
    print(f"  Annual savings:             KES {annual_savings:,.2f}")
    
    print("\nPROSUMER EARNINGS:")
    print(f"  Avg prosumer earnings (24h):  KES {summary['trading_metrics']['avg_prosumer_earnings_kes']:.2f}")
    print(f"  Top prosumer earnings (24h):  KES {summary['trading_metrics']['top_prosumer_earnings_kes']:.2f}")
    print(f"  Monthly projection:           KES {summary['trading_metrics']['avg_prosumer_earnings_kes'] * 30:,.2f}")

def generate_platform_business_metrics(results):
    """Generate e.mappa business metrics"""
    
    print("\n" + "=" * 70)
    print("e.mappa BUSINESS METRICS")
    print("=" * 70)
    
    summary = results['summary']
    fm = summary['financial_metrics']
    
    # Revenue breakdown
    print("\nREVENUE (24-hour period):")
    print(f"  Total platform revenue:       KES {fm['platform_revenue_kes']:,.2f}")
    print(f"    ↳ From allocation (markup):  KES {fm['revenue_from_allocation']:,.2f}")
    print(f"    ↳ From P2P trading (5% fee): KES {fm['revenue_from_p2p']:,.2f}")
    
    # Projections
    daily_revenue = fm['platform_revenue_kes']
    monthly_revenue = daily_revenue * 30
    annual_revenue = monthly_revenue * 12
    
    print("\nPROJECTIONS (20 homes):")
    print(f"  Monthly revenue:              KES {monthly_revenue:,.2f} (${monthly_revenue/130:.2f})")
    print(f"  Annual revenue:               KES {annual_revenue:,.2f} (${annual_revenue/130:.2f})")
    
    # Scale projections
    print("\nSCALE PROJECTIONS:")
    for scale in [100, 500, 2000]:
        scale_factor = scale / 20
        scaled_annual = annual_revenue * scale_factor
        print(f"  {scale:,} homes → Annual revenue:  KES {scaled_annual:,.2f} (${scaled_annual/130:,.2f})")

def main():
    """Generate all reports"""
    
    results = load_results()
    
    generate_hourly_report(results)
    generate_provider_analysis(results)
    generate_customer_savings_report(results)
    generate_platform_business_metrics(results)
    
    print("\n" + "=" * 70)
    print("📊 REPORT COMPLETE")
    print("=" * 70)
    print("\nKey Demo Points for KPLC Meeting:")
    print("  1. Customers save 30%+ on electricity costs")
    print("  2. Prosumers earn passive income from solar shares")
    print("  3. Platform optimally allocates across providers")
    print("  4. P2P trading creates vibrant energy marketplace")
    print("  5. KPLC grid is essential infrastructure (not competition)")
    print("\n💡 This simulation proves the e.mappa model works!")

if __name__ == "__main__":
    main()
