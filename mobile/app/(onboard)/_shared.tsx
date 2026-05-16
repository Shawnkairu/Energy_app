import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { BusinessType, GeocodeResult, StakeholderRole } from "@emappa/shared";
import { AppMark, GlassCard, Label, PrimaryButton, colors, spacing, typography } from "@emappa/ui";
import { SecondaryButton } from "../(auth)/authShell";
import { PilotBanner } from "../../components/PilotBanner";
import { RoofMap } from "../../components/RoofMap";
import { useAuth } from "../../components/AuthContext";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";

export type RoleHomePath =
  | "/(resident)/home"
  | "/(homeowner)/home"
  | "/(building-owner)/home"
  | "/(provider)/discover"
  | "/(electrician)/discover"
  | "/(financier)/discover";

export interface CompleteBody {
  displayName?: string;
  businessType?: BusinessType;
  profile?: Record<string, unknown>;
}

export function OnboardShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <AppMark size={42} />
        </View>
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  onBlur,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "number-pad" | "numeric";
  onBlur?: () => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.dim}
        keyboardType={keyboardType}
        onBlur={onBlur}
        multiline={multiline}
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

export function ChoiceGroup<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: TValue;
  options: Array<{ label: string; value: TValue; detail?: string }>;
  onChange: (value: TValue) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Label>{label}</Label>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${option.label}`}
            onPress={() => onChange(option.value)}
            style={[styles.choice, selected && styles.choiceSelected]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>{option.label}</Text>
              {option.detail ? <Text style={styles.choiceDetail}>{option.detail}</Text> : null}
            </View>
            <View style={[styles.radio, selected && styles.radioSelected]} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function MultiChoiceGroup<TValue extends string>({
  label,
  values,
  options,
  onChange,
}: {
  label: string;
  values: TValue[];
  options: Array<{ label: string; value: TValue }>;
  onChange: (values: TValue[]) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Label>{label}</Label>
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(selected ? values.filter((value) => value !== option.value) : [...values, option.value])}
            style={[styles.choice, selected && styles.choiceSelected]}
          >
            <Text style={styles.choiceTitle}>{option.label}</Text>
            <View style={[styles.check, selected && styles.checkSelected]}>
              {selected ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ActionButton({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  if (variant === "secondary") {
    return (
      <SecondaryButton onPress={onPress} disabled={disabled} accessibilityLabel={accessibilityLabel}>
        {children}
      </SecondaryButton>
    );
  }
  return (
    <PrimaryButton onPress={onPress} disabled={disabled} accessibilityLabel={accessibilityLabel}>
      {children}
    </PrimaryButton>
  );
}

export function StatusText({ status, tone = "muted" }: { status?: string | null; tone?: "muted" | "error" | "success" }) {
  if (!status) {
    return null;
  }

  return <Text style={[styles.status, tone === "error" && styles.error, tone === "success" && styles.success]}>{status}</Text>;
}

export function useFinishOnboarding(role: StakeholderRole, destination: RoleHomePath) {
  const api = useApi();
  const router = useRouter();
  const { completeProfile, refreshUser, setRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = useCallback(
    async (body: CompleteBody = {}) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await api.completeOnboarding(body);
        completeProfile({ displayName: body.displayName, businessType: body.businessType ?? null });
        refreshUser(result.user);
        setRole(result.user.role ?? role);
        router.replace(destination);
      } catch (cause) {
        setError(errorMessage(cause));
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, completeProfile, destination, refreshUser, role, router, setRole],
  );

  return { finish, isSubmitting, error };
}

export function useGeocodedAddress(initial = "") {
  const api = useApi();
  const [address, setAddress] = useState(initial);
  const [geocode, setGeocode] = useState<GeocodeResult | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const geocodeAddress = useCallback(async () => {
    const query = address.trim();
    if (!query) {
      setGeocode(null);
      setGeocodeError("Enter an address before continuing.");
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await api.geocode(query);
      setGeocode(result);
      setAddress(result.formattedAddress);
    } catch (cause) {
      setGeocode(null);
      setGeocodeError(errorMessage(cause));
    } finally {
      setIsGeocoding(false);
    }
  }, [address, api]);

  return { address, setAddress, geocode, isGeocoding, geocodeError, geocodeAddress };
}

export function PledgeStep({
  role,
  destination,
  buildingId,
  completeBody,
}: {
  role: StakeholderRole;
  destination: RoleHomePath;
  buildingId: string;
  completeBody?: CompleteBody;
}) {
  const api = useApi();
  const { finish, isSubmitting, error } = useFinishOnboarding(role, destination);
  const [amount, setAmount] = useState("");
  const [pledgeStatus, setPledgeStatus] = useState<string | null>(null);
  const [pledgeError, setPledgeError] = useState<string | null>(null);

  async function pledgeAndFinish() {
    const amountKes = Number(amount);
    if (!Number.isFinite(amountKes) || amountKes <= 0) {
      setPledgeError("Enter a pledge amount greater than 0 KES.");
      return;
    }

    setPledgeError(null);
    try {
      const result = await api.commitPrepaid({ buildingId, amountKes });
      setPledgeStatus(`${formatKes(result.commitment.amountKes)} pledge ${result.commitment.status}.`);
      await finish(completeBody);
    } catch (cause) {
      setPledgeError(errorMessage(cause));
    }
  }

  return (
    <OnboardShell
      eyebrow="Optional pledge"
      title="Pledge prepaid solar tokens"
      footer={
        <View style={{ gap: 10 }}>
          <ActionButton onPress={pledgeAndFinish} disabled={isSubmitting}>
            {isSubmitting ? "Finishing..." : "Pledge and finish"}
          </ActionButton>
          <ActionButton onPress={() => finish(completeBody)} variant="secondary" disabled={isSubmitting}>
            Skip for now
          </ActionButton>
        </View>
      }
    >
      <PilotBanner title="Pilot pledge" message="Pledges are non-binding until cash rails are live. A pledge does not guarantee e.mappa supply until your apartment is capacity-cleared and ATS-activated." />
      <GlassCard>
        <TextField label="Amount in KES" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="1000" />
        <Text style={styles.helper}>
          Pledged demand helps DRS, but usable solar tokens only unlock after capacity fit, apartment ATS/PAYG mapping, and verified switching between the e.mappa solar path and KPLC.
        </Text>
      </GlassCard>
      <StatusText status={pledgeStatus} tone="success" />
      <StatusText status={pledgeError ?? error} tone="error" />
    </OnboardShell>
  );
}

export function RoofCaptureStep({
  role,
  destination,
  buildingId,
  lat,
  lon,
  nextLabel,
  nextHref,
}: {
  role: StakeholderRole;
  destination: RoleHomePath;
  buildingId: string;
  lat: number;
  lon: number;
  nextLabel: string;
  nextHref?: string;
}) {
  const api = useApi();
  const router = useRouter();
  const { finish, isSubmitting: isFinishing, error: finishError } = useFinishOnboarding(role, destination);
  const [mode, setMode] = useState<"suggest" | "trace" | "manual">("suggest");
  const [area, setArea] = useState("");
  const [tracePoints, setTracePoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loadSuggestion = useCallback(() => api.suggestRoof(buildingId, lat, lon), [buildingId, lat, lon]);
  const suggestionState = useApiData(loadSuggestion, [buildingId, lat, lon]);

  const suggestedArea = useMemo(() => {
    if (!suggestionState.data || "available" in suggestionState.data) {
      return 0;
    }
    return Math.round(suggestionState.data.areaM2);
  }, [suggestionState.data]);

  async function saveSuggested() {
    if (!suggestionState.data || "available" in suggestionState.data) {
      setSaveError("No roof suggestion is available. Redraw or type the roof area.");
      return;
    }

    await saveRoof({
      polygonGeojson: suggestionState.data.geojson,
      areaM2: suggestionState.data.areaM2,
      source: "microsoft_footprints",
    });
  }

  async function saveTraced() {
    if (tracePoints.length < 3) {
      setSaveError("Tap at least three roof corners before saving the traced roof.");
      return;
    }

    const areaM2 = Number(area);
    if (!Number.isFinite(areaM2) || areaM2 <= 0) {
      setSaveError("Enter the traced roof area in square metres.");
      return;
    }

    await saveRoof({
      polygonGeojson: polygonFromTrace(tracePoints, lat, lon),
      areaM2,
      source: "owner_traced",
    });
  }

  async function saveManual() {
    const areaM2 = Number(area);
    if (!Number.isFinite(areaM2) || areaM2 <= 0) {
      setSaveError("Enter a roof area greater than 0 square metres.");
      return;
    }

    await saveRoof({ areaM2, source: "owner_typed" });
  }

  async function saveRoof(input: { polygonGeojson?: unknown; areaM2?: number; source: string }) {
    setIsSaving(true);
    setSaveError(null);
    try {
      await api.setRoof(buildingId, input);
      if (nextHref) {
        router.push(nextHref);
      } else {
        await finish();
      }
    } catch (cause) {
      setSaveError(errorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  }

  const busy = isSaving || isFinishing || suggestionState.isLoading;

  return (
    <OnboardShell
      eyebrow="Roof capture"
      title="Confirm usable rooftop area"
      footer={
        <View style={{ gap: 10 }}>
          {mode === "suggest" ? <ActionButton onPress={saveSuggested} disabled={busy}>{busy ? "Checking..." : "Looks right"}</ActionButton> : null}
          {mode === "trace" ? <ActionButton onPress={saveTraced} disabled={busy}>{busy ? "Saving..." : nextLabel}</ActionButton> : null}
          {mode === "manual" ? <ActionButton onPress={saveManual} disabled={busy}>{busy ? "Saving..." : nextLabel}</ActionButton> : null}
        </View>
      }
    >
      <RoofMap title="Roof footprint" usableAreaSqm={mode === "suggest" ? suggestedArea : Number(area) || 0} />
      {mode === "suggest" ? (
        <GlassCard>
          <Label>Microsoft footprint suggestion</Label>
          {suggestionState.isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.orangeDeep} />
              <Text style={styles.helperShrink}>Fetching suggested footprint…</Text>
            </View>
          ) : null}
          {suggestionState.error ? (
            <>
              <Text style={styles.error}>{suggestionState.error.message}</Text>
              <ActionButton onPress={suggestionState.refetch} variant="secondary" accessibilityLabel="Retry footprint suggestion">
                Retry suggestion
              </ActionButton>
            </>
          ) : null}
          {suggestionState.data && "available" in suggestionState.data ? (
            <Text style={styles.helper}>
              No automatic footprint matched this pin. Trace the roof corners or enter area manually below.
            </Text>
          ) : null}
          {suggestedArea > 0 ? <Text style={styles.cardTitle}>{suggestedArea.toLocaleString()} sqm suggested</Text> : null}
          <View style={styles.inlineActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Redraw roof footprint" onPress={() => setMode("trace")} style={styles.linkButton}>
              <Text style={styles.linkText}>Let me redraw</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Enter roof area manually" onPress={() => setMode("manual")} style={styles.linkButton}>
              <Text style={styles.linkText}>Type sqm</Text>
            </Pressable>
          </View>
        </GlassCard>
      ) : null}
      {mode === "trace" ? (
        <GlassCard>
          <Label>Owner-traced roof</Label>
          <Pressable
            onPress={(event) => setTracePoints((points) => [...points, { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }])}
            style={styles.tracePad}
          >
            {tracePoints.map((point, index) => (
              <View key={`${point.x}-${point.y}-${index}`} style={[styles.tracePoint, { left: point.x - 5, top: point.y - 5 }]} />
            ))}
            <Text style={styles.traceText}>Tap roof corners ({tracePoints.length})</Text>
          </Pressable>
          <TextField label="Traced usable area (sqm)" value={area} onChangeText={setArea} keyboardType="numeric" placeholder="120" />
          <ActionButton onPress={() => setTracePoints([])} variant="secondary">Clear traced corners</ActionButton>
        </GlassCard>
      ) : null}
      {mode === "manual" ? (
        <GlassCard>
          <TextField label="Manual usable area (sqm)" value={area} onChangeText={setArea} keyboardType="numeric" placeholder="120" />
          <Text style={styles.helper}>Use this only when the footprint service or traced polygon is not reliable enough.</Text>
        </GlassCard>
      ) : null}
      <StatusText status={saveError ?? finishError} tone="error" />
    </OnboardShell>
  );
}

export function useRequiredParams<TParams extends Record<string, string>>(keys: Array<keyof TParams & string>) {
  const params = useLocalSearchParams();
  const values: Record<string, string> = {};

  for (const key of keys) {
    const value = params[key];
    values[key] = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  }

  return values as TParams;
}

export function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

export function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "The API request failed.";
}

function polygonFromTrace(points: Array<{ x: number; y: number }>, lat: number, lon: number) {
  const scale = 0.0000025;
  const coordinates = points.map((point) => [lon + (point.x - 140) * scale, lat - (point.y - 80) * scale]);
  coordinates.push(coordinates[0]);
  return { type: "Polygon", coordinates: [coordinates] };
}

export const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { gap: spacing.lg, paddingHorizontal: spacing.xl, paddingTop: spacing.lg + 2, paddingBottom: 120 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  eyebrow: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: spacing.sm,
  },
  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    gap: 10,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  helperShrink: { color: colors.muted, fontSize: typography.small, lineHeight: 20, flexShrink: 1 },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textarea: { minHeight: 88, textAlignVertical: "top" },
  helper: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 10 },
  status: { color: colors.muted, fontSize: typography.small, lineHeight: 20 },
  error: { color: colors.red },
  success: { color: colors.green },
  choice: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  choiceSelected: { borderColor: colors.orangeDeep, backgroundColor: `${colors.orangeDeep}10` },
  choiceTitle: { color: colors.text, fontSize: typography.body, fontWeight: "700" },
  choiceDetail: { color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 3 },
  radio: { borderColor: colors.border, borderRadius: 999, borderWidth: 2, height: 18, width: 18 },
  radioSelected: { borderColor: colors.orangeDeep, backgroundColor: colors.orangeDeep },
  check: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkSelected: { borderColor: colors.orangeDeep, backgroundColor: colors.orangeDeep },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: "900" },
  cardTitle: { color: colors.text, fontSize: typography.title, fontWeight: "800", letterSpacing: -0.3, marginTop: 10 },
  inlineActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  linkButton: { borderRadius: 999, backgroundColor: "rgba(216, 119, 56, 0.1)", paddingHorizontal: 12, paddingVertical: 8 },
  linkText: { color: colors.orangeDeep, fontSize: typography.small, fontWeight: "800" },
  tracePad: {
    height: 170,
    overflow: "hidden",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(103, 64, 34, 0.06)",
    marginVertical: 12,
  },
  tracePoint: { position: "absolute", width: 10, height: 10, borderRadius: 999, backgroundColor: colors.orangeDeep },
  traceText: { color: colors.muted, fontSize: typography.small, fontWeight: "700", padding: 14 },
});

export default function OnboardSharedRoutePlaceholder() {
  return null;
}
