"""
e.mappa P2P Trading Marketplace
Enables prosumers to sell excess energy credits to other customers
"""

from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum
import heapq

class OrderType(Enum):
    BUY = "BUY"
    SELL = "SELL"

@dataclass
class Order:
    """Represents a buy or sell order in the marketplace"""
    user_id: str
    order_type: OrderType
    quantity_kwh: float
    price_per_kwh: float
    hour: int
    timestamp: float

@dataclass
class Trade:
    """Represents a completed trade"""
    buyer_id: str
    seller_id: str
    quantity_kwh: float
    price_per_kwh: float
    total_kes: float
    hour: int
    platform_fee_kes: float

class P2PMarketplace:
    """
    Order book for peer-to-peer energy trading
    Matches buy and sell orders
    """
    
    def __init__(self, platform_fee_percent: float = 5.0):
        """
        Args:
            platform_fee_percent: % fee e.mappa takes on each trade (default 5%)
        """
        self.platform_fee_percent = platform_fee_percent
        self.buy_orders = []   # Max heap (highest price first)
        self.sell_orders = []  # Min heap (lowest price first)
        self.trades = []
        self.total_platform_revenue = 0
        self._order_counter = 0  # For guaranteed unique ordering
        
    def add_order(self, order: Order) -> List[Trade]:
        """
        Add an order to the order book and attempt to match
        Returns list of trades executed
        """
        if order.order_type == OrderType.BUY:
            # Negative for max heap (Python heapq is min heap)
            # Use counter as tiebreaker to avoid Order comparison
            heapq.heappush(self.buy_orders, (-order.price_per_kwh, self._order_counter, order))
        else:
            heapq.heappush(self.sell_orders, (order.price_per_kwh, self._order_counter, order))
        
        self._order_counter += 1
        return self._match_orders()
    
    def _match_orders(self) -> List[Trade]:
        """Match buy and sell orders when prices align"""
        new_trades = []
        
        while self.buy_orders and self.sell_orders:
            best_buy_price, _, buy_order = self.buy_orders[0]
            best_sell_price, _, sell_order = self.sell_orders[0]
            
            best_buy_price = -best_buy_price  # Convert back from negative
            
            # Can trade if buy price >= sell price
            if best_buy_price >= best_sell_price:
                # Trade at seller's price (market standard)
                trade_price = best_sell_price
                trade_quantity = min(buy_order.quantity_kwh, sell_order.quantity_kwh)
                
                # Calculate platform fee
                gross_value = trade_quantity * trade_price
                platform_fee = gross_value * (self.platform_fee_percent / 100)
                
                # Record trade
                trade = Trade(
                    buyer_id=buy_order.user_id,
                    seller_id=sell_order.user_id,
                    quantity_kwh=trade_quantity,
                    price_per_kwh=trade_price,
                    total_kes=gross_value,
                    hour=buy_order.hour,
                    platform_fee_kes=platform_fee
                )
                
                self.trades.append(trade)
                new_trades.append(trade)
                self.total_platform_revenue += platform_fee
                
                # Update remaining quantities
                buy_order.quantity_kwh -= trade_quantity
                sell_order.quantity_kwh -= trade_quantity
                
                # Remove fulfilled orders
                if buy_order.quantity_kwh <= 0.001:  # Floating point tolerance
                    heapq.heappop(self.buy_orders)
                if sell_order.quantity_kwh <= 0.001:
                    heapq.heappop(self.sell_orders)
            else:
                break  # No more matches possible
        
        return new_trades
    
    def get_market_price(self) -> float:
        """Get current market clearing price"""
        if not self.buy_orders or not self.sell_orders:
            return 0.0
        
        best_buy = -self.buy_orders[0][0]
        best_sell = self.sell_orders[0][0]
        
        return (best_buy + best_sell) / 2
    
    def get_order_book_depth(self) -> Dict:
        """Get current order book state"""
        return {
            "buy_orders": len(self.buy_orders),
            "sell_orders": len(self.sell_orders),
            "total_buy_volume": sum(o[2].quantity_kwh for o in self.buy_orders),
            "total_sell_volume": sum(o[2].quantity_kwh for o in self.sell_orders)
        }


class TradingAgent:
    """Automated trading agent for prosumers and consumers"""
    
    def __init__(self, user_id: str, user_type: str):
        """
        Args:
            user_id: Customer ID
            user_type: 'prosumer' or 'consumer'
        """
        self.user_id = user_id
        self.user_type = user_type
        self.total_bought = 0
        self.total_sold = 0
        self.total_spent = 0
        self.total_earned = 0
    
    def create_sell_order(self, hour: int, excess_kwh: float, 
                         market_conditions: Dict) -> Order:
        """
        Prosumer creates sell order for excess energy
        Dynamic pricing based on time of day and market
        """
        # Base price below average provider price
        base_price = 19.0  # KES/kWh
        
        # Premium during peak hours (evening)
        if 18 <= hour <= 22:
            multiplier = 1.3  # KES 24.7/kWh
        elif 6 <= hour <= 9:
            multiplier = 1.15  # KES 21.85/kWh
        else:
            multiplier = 1.0  # KES 19/kWh
        
        # Adjust based on supply/demand
        if market_conditions.get('excess_supply', False):
            multiplier *= 0.95  # Lower price when oversupplied
        
        price = base_price * multiplier
        
        return Order(
            user_id=self.user_id,
            order_type=OrderType.SELL,
            quantity_kwh=excess_kwh,
            price_per_kwh=round(price, 2),
            hour=hour,
            timestamp=hour
        )
    
    def create_buy_order(self, hour: int, deficit_kwh: float,
                        market_conditions: Dict) -> Order:
        """
        Consumer creates buy order for needed energy
        Willing to pay more during peak hours
        """
        # Base willingness to pay
        base_price = 22.0  # KES/kWh (still cheaper than KPLC)
        
        # Higher willingness during peak hours
        if 18 <= hour <= 22:
            multiplier = 1.4  # KES 30.8/kWh (near KPLC pricing)
        elif 6 <= hour <= 9:
            multiplier = 1.2  # KES 26.4/kWh
        else:
            multiplier = 1.0  # KES 22/kWh
        
        # Adjust based on urgency
        if market_conditions.get('low_supply', False):
            multiplier *= 1.1  # Pay more when supply is tight
        
        price = base_price * multiplier
        
        return Order(
            user_id=self.user_id,
            order_type=OrderType.BUY,
            quantity_kwh=deficit_kwh,
            price_per_kwh=round(price, 2),
            hour=hour,
            timestamp=hour
        )


def simulate_p2p_trading_hour(hour: int, 
                              prosumers: List,
                              consumers: List,
                              total_solar_output: float,
                              total_solar_capacity: float,
                              marketplace: P2PMarketplace) -> Dict:
    """
    Simulate P2P trading for one hour
    
    Returns:
        Dictionary with trading statistics
    """
    
    # Calculate prosumer positions
    prosumer_positions = {}
    for prosumer in prosumers:
        # Generate their share of solar output
        generation = prosumer.generate_production_from_share(
            hour, total_solar_output, total_solar_capacity
        )
        prosumer.hourly_generation.append(generation)
        
        consumption = prosumer.hourly_consumption[hour]
        net_position = generation - consumption
        
        prosumer_positions[prosumer.customer_id] = net_position
    
    # Market conditions
    total_excess = sum(p for p in prosumer_positions.values() if p > 0)
    total_deficit = abs(sum(p for p in prosumer_positions.values() if p < 0))
    
    market_conditions = {
        'excess_supply': total_excess > total_deficit * 1.2,
        'low_supply': total_excess < total_deficit * 0.8
    }
    
    # Create trading agents and place orders
    agents = {}
    orders_placed = 0
    
    # Prosumers place sell orders for excess
    for prosumer in prosumers:
        agent = TradingAgent(prosumer.customer_id, 'prosumer')
        agents[prosumer.customer_id] = agent
        
        net_position = prosumer_positions[prosumer.customer_id]
        
        if net_position > 0.1:  # Has excess to sell
            order = agent.create_sell_order(hour, net_position, market_conditions)
            marketplace.add_order(order)
            orders_placed += 1
    
    # Some consumers place buy orders
    # (Not all - some just use allocated provider power)
    for i, consumer in enumerate(consumers):
        if i % 3 == 0:  # Only 1/3 of consumers actively trade
            agent = TradingAgent(consumer.customer_id, 'consumer')
            agents[consumer.customer_id] = agent
            
            # They want to buy extra beyond allocation
            extra_need = consumer.hourly_consumption[hour] * 0.2  # 20% extra
            order = agent.create_buy_order(hour, extra_need, market_conditions)
            marketplace.add_order(order)
            orders_placed += 1
    
    # Get trading statistics
    trades_this_hour = [t for t in marketplace.trades if t.hour == hour]
    
    stats = {
        'hour': hour,
        'orders_placed': orders_placed,
        'trades_executed': len(trades_this_hour),
        'total_kwh_traded': sum(t.quantity_kwh for t in trades_this_hour),
        'total_value_kes': sum(t.total_kes for t in trades_this_hour),
        'platform_revenue_kes': sum(t.platform_fee_kes for t in trades_this_hour),
        'avg_trade_price': (sum(t.price_per_kwh for t in trades_this_hour) / 
                           len(trades_this_hour)) if trades_this_hour else 0,
        'market_clearing_price': marketplace.get_market_price(),
        'order_book': marketplace.get_order_book_depth()
    }
    
    return stats


if __name__ == "__main__":
    print("=" * 60)
    print("e.mappa P2P Marketplace Test")
    print("=" * 60)
    
    # Test order matching
    marketplace = P2PMarketplace(platform_fee_percent=5.0)
    
    # Simulate some orders
    print("\nSimulating order placement...")
    
    # Prosumers selling
    marketplace.add_order(Order("prosumer_01", OrderType.SELL, 2.5, 20.0, 12, 12.0))
    marketplace.add_order(Order("prosumer_02", OrderType.SELL, 3.0, 19.0, 12, 12.1))
    marketplace.add_order(Order("prosumer_03", OrderType.SELL, 1.8, 21.0, 12, 12.2))
    
    # Consumers buying
    marketplace.add_order(Order("consumer_01", OrderType.BUY, 2.0, 22.0, 12, 12.3))
    marketplace.add_order(Order("consumer_02", OrderType.BUY, 1.5, 21.0, 12, 12.4))
    marketplace.add_order(Order("consumer_03", OrderType.BUY, 2.5, 20.0, 12, 12.5))
    
    print(f"\nTrades executed: {len(marketplace.trades)}")
    print(f"Total platform revenue: KES {marketplace.total_platform_revenue:.2f}")
    
    print("\nTrade Details:")
    for trade in marketplace.trades:
        print(f"  {trade.seller_id} → {trade.buyer_id}: "
              f"{trade.quantity_kwh:.2f} kWh @ KES {trade.price_per_kwh:.2f} "
              f"(Platform fee: KES {trade.platform_fee_kes:.2f})")
    
    print("\nRemaining Order Book:")
    depth = marketplace.get_order_book_depth()
    print(f"  Buy orders: {depth['buy_orders']} ({depth['total_buy_volume']:.2f} kWh)")
    print(f"  Sell orders: {depth['sell_orders']} ({depth['total_sell_volume']:.2f} kWh)")
