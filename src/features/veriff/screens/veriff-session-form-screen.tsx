import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { veriffApi } from "@/src/features/veriff/api/veriff.api";
import {
  DOCUMENT_TYPE_LABELS,
  SESSION_FORM_DOC_TYPES,
  SESSION_FORM_FLOW_MODES,
} from "@/src/features/veriff/constants/session-form-options";
import { SessionFormStrings } from "@/src/features/veriff/constants/strings";
import {
  veriffFormSchema,
  type VeriffFormValues,
} from "@/src/features/veriff/forms/veriff-form.schema";
import { appendSubmission } from "@/src/features/veriff/store/submissions.slice";
import { setSession } from "@/src/features/veriff/store/veriff.slice";
import { Colors } from "@/src/shared/constants/colors";
import { Layout } from "@/src/shared/constants/layout";
import { useAppDispatch } from "@/src/shared/lib/store/store";

export const VeriffSessionFormScreen = () => {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VeriffFormValues>({
    resolver: yupResolver(veriffFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      idNumber: "",
      documentNumber: "",
      documentType: "ID_CARD",
      documentCountry: "",
      flowMode: "doc-selfie",
    },
  });

  const onSubmit = async (values: VeriffFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        documentCountry: values.documentCountry.toUpperCase(),
        vendorData: `${SessionFormStrings.vendorDataPrefix}${Date.now()}`,
        ...(values.idNumber?.trim()
          ? { idNumber: values.idNumber.trim() }
          : {}),
      };
      const response = await veriffApi.startSession(payload);

      if (!response.verificationUrl) {
        Alert.alert(
          SessionFormStrings.alertSessionFailedTitle,
          SessionFormStrings.alertNoUrl,
        );
        return;
      }

      dispatch(appendSubmission({ sessionId: response.sessionId, status: "created" }));

      dispatch(
        setSession({
          sessionId: response.sessionId,
          flowMode: values.flowMode,
          verificationUrl: response.verificationUrl,
        }),
      );
      router.push("/verification/webview");
    } catch (e) {
      Alert.alert(SessionFormStrings.alertSessionFailedTitle, (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>{SessionFormStrings.heading}</Text>
      <Text style={styles.hint}>{SessionFormStrings.countryHint}</Text>

      <Field label={SessionFormStrings.labelFirstName} error={errors.firstName?.message}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder={SessionFormStrings.phFirstName}
              placeholderTextColor={Colors.textLabel}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
            />
          )}
        />
      </Field>

      <Field label={SessionFormStrings.labelLastName} error={errors.lastName?.message}>
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder={SessionFormStrings.phLastName}
              placeholderTextColor={Colors.textLabel}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
            />
          )}
        />
      </Field>

      <Field label={SessionFormStrings.labelIdNumber} error={errors.idNumber?.message}>
        <Controller
          control={control}
          name="idNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder={SessionFormStrings.phOptional}
              placeholderTextColor={Colors.textLabel}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </Field>

      <Field
        label={SessionFormStrings.labelDocumentNumber}
        error={errors.documentNumber?.message}
      >
        <Controller
          control={control}
          name="documentNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder={SessionFormStrings.phDocumentNumber}
              placeholderTextColor={Colors.textLabel}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </Field>

      <Field
        label={SessionFormStrings.labelDocumentCountry}
        error={errors.documentCountry?.message}
      >
        <Controller
          control={control}
          name="documentCountry"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder={SessionFormStrings.phCountry}
              placeholderTextColor={Colors.textLabel}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="characters"
              maxLength={2}
            />
          )}
        />
      </Field>

      <Text style={styles.sectionLabel}>{SessionFormStrings.sectionDocumentType}</Text>
      <Controller
        control={control}
        name="documentType"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chipRow}>
            {SESSION_FORM_DOC_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[styles.chip, value === t && styles.chipActive]}
                onPress={() => onChange(t)}
              >
                <Text
                  style={[
                    styles.chipText,
                    value === t && styles.chipTextActive,
                  ]}
                >
                  {DOCUMENT_TYPE_LABELS[t]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      {errors.documentType ? (
        <Text style={styles.fieldError}>{errors.documentType.message}</Text>
      ) : null}

      <Text style={styles.sectionLabel}>{SessionFormStrings.sectionFlow}</Text>
      <Controller
        control={control}
        name="flowMode"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chipRow}>
            {SESSION_FORM_FLOW_MODES.map((m) => (
              <Pressable
                key={m}
                style={[styles.chip, value === m && styles.chipActive]}
                onPress={() => onChange(m)}
              >
                <Text
                  style={[
                    styles.chipText,
                    value === m && styles.chipTextActive,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      {errors.flowMode ? (
        <Text style={styles.fieldError}>{errors.flowMode.message}</Text>
      ) : null}

      <Pressable
        style={[
          styles.primaryButton,
          submitting && styles.primaryButtonDisabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.onAccent} />
        ) : (
          <Text style={styles.primaryText}>{SessionFormStrings.startVerification}</Text>
        )}
      </Pressable>

      <Pressable style={styles.textButton} onPress={() => router.replace("/")}>
        <Text style={styles.textButtonLabel}>{SessionFormStrings.backToHome}</Text>
      </Pressable>
    </ScrollView>
  );
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 4,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  hint: { color: Colors.textDim, fontSize: 13, marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  fieldError: { color: Colors.error, fontSize: 12, marginTop: 4 },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Layout.radiusChip,
    backgroundColor: Colors.surfaceMuted,
  },
  chipActive: { backgroundColor: Colors.accent },
  chipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: Colors.onAccent },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Layout.radiusLg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryText: { color: Colors.onAccent, fontSize: 16, fontWeight: "700" },
  textButton: { alignItems: "center", marginTop: 16, padding: 8 },
  textButtonLabel: { color: Colors.textDim, fontSize: 15 },
});
