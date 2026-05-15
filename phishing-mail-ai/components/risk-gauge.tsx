import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RiskGaugeProps {
  score: number; // 0 to 100
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);
  
  const getLevelColor = (s: number) => {
    if (s < 30) return '#4CAF50'; // Safe
    if (s < 60) return '#FFC107'; // Caution
    return '#F44336'; // Danger
  };

  const getLevelLabel = (s: number) => {
    if (s < 30) return '안전';
    if (s < 60) return '주의';
    return '위험';
  };

  const color = getLevelColor(score);
  const label = getLevelLabel(score);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <View style={[styles.gaugeBackground, { backgroundColor: Colors[colorScheme].icon + '22' }]} />
        <Animated.View 
          style={[
            styles.gaugeFill, 
            { 
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }), 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <View style={styles.labelContainer}>
        <ThemedText type="defaultSemiBold" style={{ color }}>{label}</ThemedText>
        <ThemedText type="defaultSemiBold">{score}점</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    width: '100%',
  },
  gaugeContainer: {
    height: 12,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
