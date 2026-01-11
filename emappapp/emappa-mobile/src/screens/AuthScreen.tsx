import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onDemoMode: () => void;
}

export function AuthScreen({ onLogin, onDemoMode }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = () => {
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Brand Section */}
        <View style={styles.header}>
          <Text style={styles.appName}>e.mappa</Text>
        </View>

        {/* Auth Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          {!isSignUp && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!email || !password) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!email || !password}
          >
            <Text style={styles.submitButtonText}>
              {isSignUp ? 'Sign Up' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {/* Toggle Sign Up / Log In */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleLink}>
                {isSignUp ? ' Log In' : ' Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo Mode Button */}
          <TouchableOpacity style={styles.demoButton} onPress={onDemoMode}>
            <Ionicons name="play-circle-outline" size={22} color={colors.text} />
            <Text style={styles.demoButtonText}>Try Demo App</Text>
          </TouchableOpacity>

          <Text style={styles.demoDescription}>
            Explore all features with sample data
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    marginTop: spacing.xxxl,
  },
  appName: {
    fontSize: 40,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  // Form
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.soft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '400',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  toggleText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  toggleLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '400',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.soft,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  // Demo Button
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.soft,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  demoButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '400',
  },
  demoDescription: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.xl,
  },
  // Footer
  footer: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
