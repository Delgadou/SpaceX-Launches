import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Launch } from '@/models/Launch';

interface Props {
  launch: Launch;
  onPress: () => void;
}

export default function LaunchCard({ launch, onPress }: Props) {
  const reused = launch.cores.some(c => c.reused);

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedView type="backgroundElement" style={styles.header}>
          <ThemedText type="small" themeColor="textSecondary">#{launch.flight_number}</ThemedText>
          {launch.success !== null && (
            <ThemedText type="small" style={styles.status}>
              {launch.success ? '✓ Success' : '✗ Failed'}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedText type="small" style={styles.name}>{launch.name}</ThemedText>

        {launch.details && (
          <ThemedText themeColor="textSecondary" numberOfLines={2} style={styles.details}>
            {launch.details}
          </ThemedText>
        )}

        <ThemedView type="backgroundElement" style={styles.tags}>
          <ThemedView type="backgroundSelected" style={styles.tag}>
            <ThemedText type="small" themeColor="textSecondary">
              {reused ? 'Reused' : 'New'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: { fontWeight: '600' },
  name: { fontWeight: '600' },
  details: { lineHeight: 20 },
  tags: { flexDirection: 'row', gap: Spacing.one },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
});
