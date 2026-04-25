import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  // Mock user data - in real app, this would come from backend
  const [profileData] = useState({
    name: user?.name || 'Shawn',
    location: 'Nairobi, Kenya',
    verified: true,
    stats: {
      trades: 12,
      reviews: 8,
      monthsOnEmappa: 6,
    },
    isHost: false,
  });

  const handleBecomeHost = () => {
    Alert.alert(
      'Become a Host',
      'Share your roof space with solar providers and earn passive income. Would you like to start the onboarding process?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Get Started', onPress: () => {
          // Navigate to host onboarding
          Alert.alert('Coming Soon', 'Host onboarding will be available in the next update!');
        }},
      ]
    );
  };

  const handleAccountSettings = () => {
    // Navigate to account settings
    Alert.alert('Account Settings', 'Settings functionality coming soon!');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileLeft}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileData.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            {profileData.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileLocation}>{profileData.location}</Text>
        </View>

        <View style={styles.profileRight}>
          {/* Stats */}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.stats.trades}</Text>
            <Text style={styles.statLabel}>Trades</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.stats.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.stats.monthsOnEmappa}</Text>
            <Text style={styles.statLabel}>Months on e.mappa</Text>
          </View>
        </View>
      </View>

      {/* Quick Cards Row */}
      <View style={styles.quickCardsRow}>
        {/* Past Energy Card */}
        <TouchableOpacity style={styles.quickCard}>
          <View style={styles.newBadge}>
          </View>
          <View style={styles.quickCardImages}>
            {/* Stacked preview images */}
            <View style={[styles.previewImage, styles.previewImage1]}>
              <Ionicons name="flash" size={20} color={colors.primary} />
            </View>
            <View style={[styles.previewImage, styles.previewImage2]}>
              <Ionicons name="sunny" size={20} color={colors.accent} />
            </View>
          </View>
          <Text style={styles.quickCardTitle}>Energy history</Text>
        </TouchableOpacity>

        {/* Connections Card */}
        <TouchableOpacity style={styles.quickCard}>
          <View style={styles.newBadge}>
          </View>
          <View style={styles.quickCardImages}>
            {/* Connection avatars */}
            <View style={[styles.connectionAvatar, styles.connectionAvatar1]}>
              <Text style={styles.connectionAvatarText}>S</Text>
            </View>
            <View style={[styles.connectionAvatar, styles.connectionAvatar2]}>
              <Text style={styles.connectionAvatarText}>J</Text>
            </View>
          </View>
          <Text style={styles.quickCardTitle}>Connections</Text>
        </TouchableOpacity>
      </View>

      {/* Become a Host Section */}
      <View style={styles.hostSection}>
        <View style={styles.hostContent}>
          <View style={styles.hostIllustration}>
            <Ionicons name="home" size={40} color={colors.accent} />
          </View>
          <View style={styles.hostText}>
            <Text style={styles.hostTitle}>Become a host</Text>
            <Text style={styles.hostDescription}>
              Share your roof space with solar providers and earn passive income.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.switchHostButton} onPress={handleBecomeHost}>
          <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
          <Text style={styles.switchHostText}>Switch to hosting</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Links */}
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingsRow} onPress={handleAccountSettings}>
          <Ionicons name="settings-outline" size={22} color={colors.text} />
          <Text style={styles.settingsText}>Account settings</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsRow}>
          <Ionicons name="card-outline" size={22} color={colors.text} />
          <Text style={styles.settingsText}>Payment methods</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
          <Text style={styles.settingsText}>Privacy & security</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsRow}>
          <Ionicons name="help-circle-outline" size={22} color={colors.text} />
          <Text style={styles.settingsText}>Help center</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Demo Mode Indicator */}
      {user?.isDemoMode && (
        <View style={styles.demoIndicator}>
          <Ionicons name="information-circle" size={16} color={colors.warning} />
          <Text style={styles.demoText}>Demo Mode Active</Text>
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
    paddingTop: 60,
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.soft,
  },
  // Profile Card
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  profileLeft: {
    alignItems: 'center',
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.soft,
    paddingRight: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  profileRight: {
    flex: 1,
    paddingLeft: spacing.lg,
    justifyContent: 'center',
  },
  statItem: {
    marginVertical: spacing.sm,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.soft,
    marginVertical: spacing.xs,
  },
  // Quick Cards
  quickCardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickCardImages: {
    height: 60,
    position: 'relative',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  previewImage1: {
    left: 0,
    top: 0,
    zIndex: 2,
  },
  previewImage2: {
    left: 30,
    top: 10,
    zIndex: 1,
  },
  connectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  connectionAvatar1: {
    left: 0,
    top: 5,
    zIndex: 2,
  },
  connectionAvatar2: {
    left: 35,
    top: 5,
    zIndex: 1,
    backgroundColor: colors.accent,
  },
  connectionAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  // Host Section
  hostSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  hostIllustration: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  hostText: {
    flex: 1,
  },
  hostTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hostDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  switchHostButton: {
    backgroundColor: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  switchHostText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  // Settings
  settingsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBorder,
  },
  settingsText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.md,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  // Demo indicator
  demoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  demoText: {
    fontSize: fontSize.sm,
    color: colors.warning,
  },
});
