import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const API_URL = 'http://localhost:8000/analyze';

export default function HomeScreen() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      alert('이메일 본문을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: emailContent }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();

      router.push({
        pathname: '/result',
        params: {
          score: data.score.toString(),
          grade: data.grade,
          threats: JSON.stringify(data.threats ?? []),
          highlight_sentences: JSON.stringify(data.highlight_sentences ?? []),
        },
      });
    } catch {
      alert('분석 중 오류가 발생했습니다. 서버 연결을 확인해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView 
      style={{ backgroundColor: Colors[colorScheme].background }}
      contentContainerStyle={styles.container}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Phishing Mail AI</ThemedText>
        <ThemedText type="default">의심되는 이메일 본문을 분석해드립니다.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              color: Colors[colorScheme].text,
              borderColor: Colors[colorScheme].icon + '44',
              backgroundColor: Colors[colorScheme].background
            }
          ]}
          placeholder="이메일 본문을 여기에 붙여넣으세요..."
          placeholderTextColor={Colors[colorScheme].icon}
          multiline
          textAlignVertical="top"
          value={emailContent}
          onChangeText={setEmailContent}
        />
      </ThemedView>

      <Pressable 
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: Colors[colorScheme].tint },
          pressed && { opacity: 0.8 }
        ]}
        onPress={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color={colorScheme === 'light' ? '#fff' : '#000'} />
        ) : (
          <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].background }]}>
            분석하기
          </ThemedText>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    flexGrow: 1,
  },
  header: {
    marginBottom: 30,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  input: {
    height: 300,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
