import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const handleAnalyze = () => {
    if (!emailContent.trim()) {
      alert('이메일 본문을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Mock data based on content
      let score = 20;
      let threats = [];
      
      if (emailContent.includes('본인인증') || emailContent.includes('비밀번호')) {
        score = 85;
        threats.push({ title: '본인인증 유도', description: '"즉시 본인인증 하세요"와 같은 문구가 포함되어 있습니다.' });
        threats.push({ title: '민감 정보 요청', description: '"비밀번호를 입력하세요"와 같은 민감 정보 요청이 감지되었습니다.' });
      } else if (emailContent.includes('링크') || emailContent.includes('클릭')) {
        score = 55;
        threats.push({ title: '의심스러운 링크', description: '외부 링크 클릭을 유도하는 문구가 포함되어 있습니다.' });
      }

      router.push({
        pathname: '/result',
        params: { 
          score: score.toString(),
          threats: JSON.stringify(threats)
        }
      });
    }, 1500);
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
