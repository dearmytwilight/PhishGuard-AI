import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ThreatCardProps {
  title: string;
  description: string;
}

export function ThreatCard({ title, description }: ThreatCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <ThemedView style={styles.card}>
      <View style={styles.iconContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#F44336" />
      </View>
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
        <ThemedText type="default" style={styles.description}>{description}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F4433622',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    color: '#F44336',
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
});
