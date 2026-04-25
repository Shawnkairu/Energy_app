import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius } from '../theme';

const screenWidth = Dimensions.get('window').width;

type OrderType = 'buy' | 'sell';

interface Listing {
  id: string;
  seller: string;
  amount: number;
  pricePerKwh: number;
  distance: string;
}

// Mock P2P marketplace listings
const buyListings: Listing[] = [
  { id: '1', seller: 'John K.', amount: 15.5, pricePerKwh: 0.09, distance: '0.5 km' },
  { id: '2', seller: 'Sarah M.', amount: 22.0, pricePerKwh: 0.095, distance: '1.2 km' },
  { id: '3', seller: 'David N.', amount: 8.3, pricePerKwh: 0.10, distance: '2.1 km' },
];

export function TradingScreen() {
  const [orderType, setOrderType] = useState<OrderType>('buy');
  const [amount, setAmount] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('0.09');
  const [yourSurplus] = useState(12.5); // Mock user's surplus energy

  // Mock price history data (average P2P price over 24h)
  const priceData = {
    labels: ['9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{
      data: [0.088, 0.092, 0.095, 0.091, 0.090],
      color: () => colors.success,
      strokeWidth: 2,
    }],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 3,
    color: (opacity = 1) => colors.success,
    labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.soft,
      strokeWidth: 1,
    },
  };

  const totalCost = parseFloat(amount || '0') * parseFloat(pricePerKwh || '0');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Market Overview */}
      <View style={styles.marketCard}>
        <Text style={styles.marketLabel}>P2P Energy Market</Text>
        <View style={styles.marketRow}>
          <View style={styles.marketStat}>
            <Text style={styles.marketStatLabel}>Average Price</Text>
            <Text style={styles.marketStatValue}>KSh 0.090/kWh</Text>
          </View>
          <View style={styles.marketStat}>
            <Text style={styles.marketStatLabel}>Your Surplus</Text>
            <Text style={[styles.marketStatValue, { color: colors.success }]}>
              {yourSurplus.toFixed(1)} kWh
            </Text>
          </View>
        </View>
      </View>

      {/* Price Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Market Price (24h)</Text>
        <LineChart
          data={priceData}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          bezier
          withDots={true}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          fromZero={false}
          yAxisLabel="KSh "
          yAxisSuffix=""
          style={styles.chart}
          transparent
        />
        <Text style={styles.chartSubtext}>
          Average P2P trading price in your area
        </Text>
      </View>

      {/* Order Type Toggle */}
      <View style={styles.orderTypeContainer}>
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'buy' && styles.buyButton]}
          onPress={() => setOrderType('buy')}
        >
          <Ionicons
            name="arrow-down"
            size={18}
            color={orderType === 'buy' ? colors.background : colors.text}
          />
          <Text style={[
            styles.orderTypeText,
            orderType === 'buy' && styles.buyButtonText
          ]}>
            Buy Energy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'sell' && styles.sellButton]}
          onPress={() => setOrderType('sell')}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={orderType === 'sell' ? colors.background : colors.text}
          />
          <Text style={[
            styles.orderTypeText,
            orderType === 'sell' && styles.sellButtonText
          ]}>
            Sell Surplus
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order Form */}
      <View style={styles.orderCard}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount (kWh)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
            <Text style={styles.inputUnit}>kWh</Text>
          </View>
          {orderType === 'sell' && yourSurplus > 0 && (
            <Text style={styles.inputHint}>
              Available: {yourSurplus.toFixed(1)} kWh
            </Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Price per kWh</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>KSh</Text>
            <TextInput
              style={[styles.input, { paddingLeft: spacing.sm }]}
              value={pricePerKwh}
              onChangeText={setPricePerKwh}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.inputHint}>
            Market avg: KSh 0.090
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total {orderType === 'buy' ? 'Cost' : 'Revenue'}</Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>
              KSh {totalCost.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            orderType === 'buy' ? styles.submitBuyButton : styles.submitSellButton,
            !amount && styles.submitButtonDisabled
          ]}
          disabled={!amount}
        >
          <Text style={styles.submitButtonText}>
            {orderType === 'buy' ? 'Place Buy Order' : 'List for Sale'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Listings */}
      {orderType === 'buy' && (
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>Available Listings</Text>
          {buyListings.map((listing) => (
            <TouchableOpacity key={listing.id} style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <View style={styles.sellerInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {listing.seller.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.sellerName}>{listing.seller}</Text>
                    <View style={styles.distanceRow}>
                      <Ionicons name="location" size={12} color={colors.textMuted} />
                      <Text style={styles.distanceText}>{listing.distance}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.listingAmount}>
                  <Text style={styles.listingKwh}>{listing.amount.toFixed(1)} kWh</Text>
                  <Text style={styles.listingPrice}>
                    KSh {listing.pricePerKwh.toFixed(3)}/kWh
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.quickBuyButton}>
                <Text style={styles.quickBuyText}>Quick Buy</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  // Market Overview
  marketCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  marketLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  marketRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  marketStat: {
    flex: 1,
  },
  marketStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  marketStatValue: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
  },
  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  chartSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Order Type
  orderTypeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  buyButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  sellButton: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  orderTypeText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  },
  buyButtonText: {
    color: colors.background,
  },
  sellButtonText: {
    color: colors.background,
  },
  // Order Card
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '400',
    color: colors.text,
    paddingVertical: spacing.md,
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  inputHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.soft,
    marginVertical: spacing.md,
  },
  summarySection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    color: colors.warning,
  },
  submitButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitBuyButton: {
    backgroundColor: colors.success,
  },
  submitSellButton: {
    backgroundColor: colors.warning,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.background,
  },
  // Listings
  listingsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
  },
  listingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.background,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  listingAmount: {
    alignItems: 'flex-end',
  },
  listingKwh: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 2,
  },
  listingPrice: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '400',
  },
  quickBuyButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickBuyText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.background,
  },
});
