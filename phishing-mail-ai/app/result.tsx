import React from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RiskGauge } from '@/components/risk-gauge';
import { ThreatCard } from '@/components/threat-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ResultScreen() {
  const { score, threats } = useLocalSearchParams<{ score: string; threats: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  const parsedScore = parseInt(score || '0', 10);
  const parsedThreats = JSON.parse(threats || '[]');

  return (
    <>
      <Stack.Screen options={{ title: '분석 결과', headerShown: true }} />
      <ScrollView 
        style={{ backgroundColor: Colors[colorScheme].background }}
        contentContainerStyle={styles.container}
      >
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">위험도 분석</ThemedText>
          <RiskGauge score={parsedScore} />
          <ThemedText style={styles.summaryText}>
            이 이메일은 {parsedScore >= 70 ? '위험' : parsedScore >= 30 ? '주의' : '안전'} 수준의 위협이 감지되었습니다.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>탐지된 위협 요소</ThemedText>
          {parsedThreats.length > 0 ? (
            parsedThreats.map((threat: any, index: number) => (
              <ThreatCard 
                key={index} 
                title={threat.title} 
                description={threat.description} 
              />
            ))
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText>탐지된 위협 요소가 없습니다. 안전해 보입니다.</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <Pressable 
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: Colors[colorScheme].tint },
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].background }]}>
            돌아가기
          </ThemedText>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  section: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    // Add subtle shadow or border
    borderWidth: 1,
    borderColor: '#ccc2',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  summaryText: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
