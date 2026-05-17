import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import SpaceXService, { Launch } from '@/service/SpaceXService';

const service = new SpaceXService();

type Tab = 'launched' | 'upcoming';

function SegmentedControl({ selected, onChange }: { selected: Tab; onChange: (tab: Tab) => void }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.segmented}>
      {(['launched', 'upcoming'] as Tab[]).map((tab) => (
        <Pressable key={tab} style={styles.segmentedItem} onPress={() => onChange(tab)}>
          <ThemedView
            style={[styles.segment, selected === tab && { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor={selected === tab ? 'text' : 'textSecondary'}>
              {tab === 'launched' ? 'Launched' : 'Upcoming'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ThemedView>
  );
}

function LaunchCard({ launch, onPress }: { launch: Launch; onPress: () => void }) {
  const reused = launch.cores.some(c => c.reused);

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedView type="backgroundElement" style={styles.cardHeader}>
          <ThemedText type="small" themeColor="textSecondary">#{launch.flight_number}</ThemedText>
          {launch.success !== null && (
            <ThemedText type="small" style={styles.successLabel}>
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

export default function LaunchesScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<Tab>('launched');
  const [launched, setLaunched] = useState<Launch[]>([]);
  const [upcoming, setUpcoming] = useState<Launch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([service.fetchLaunches(), service.fetchUpcomingLaunches()]).then(
      ([launchedResult, upcomingResult]) => {
        if (launchedResult.success) setLaunched(launchedResult.data);
        if (upcomingResult.success) setUpcoming(upcomingResult.data);
        if (!launchedResult.success) setError(launchedResult.error.message);
        setLoading(false);
      }
    );
  }, []);

  const data = selectedTab === 'launched' ? launched : upcoming;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>Launches</ThemedText>

        <SegmentedControl selected={selectedTab} onChange={setSelectedTab} />

        {loading && <ActivityIndicator style={styles.loader} />}
        {error && <ThemedText themeColor="textSecondary">{error}</ThemedText>}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LaunchCard
              launch={item}
              onPress={() => router.push(`/launch/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four },
  title: { marginBottom: Spacing.three },
  loader: { marginTop: Spacing.four },
  segmented: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
    marginBottom: Spacing.three,
  },
  segmentedItem: { flex: 1 },
  segment: {
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    alignItems: 'center',
  },
  list: { gap: Spacing.two, paddingBottom: Spacing.six },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successLabel: { fontWeight: '600' },
  name: { fontWeight: '600' },
  details: { lineHeight: 20 },
  tags: { flexDirection: 'row', gap: Spacing.one },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
});
