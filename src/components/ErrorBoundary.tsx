import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (__DEV__) console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Tap below to reload this screen.
            </Text>
            {__DEV__ ? (
              <Text style={styles.detail}>{this.state.error.message}</Text>
            ) : null}
            <Pressable
              onPress={this.reset}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F4C3A' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  message: { color: '#E5E5E5', fontSize: 16, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  detail: {
    color: '#FFD580',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
