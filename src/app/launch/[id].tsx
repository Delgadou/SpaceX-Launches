import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import SpaceXService, { Launch } from '@/service/SpaceXService';

const service = new SpaceXService();

function formatDate(dateUtc: string): string {
  return new Date(dateUtc).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function statusLabel(launch: Launch): string {
  if (launch.upcoming) return 'Upcoming';
  return launch.success ? 'Success' : 'Failed';
}

export default function LaunchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    service.fetchLaunch(id).then((result) => {
      if (result.success) {
        setLaunch(result.data);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText themeColor="textSecondary">← Back</ThemedText>
        </Pressable>

        {loading && <ActivityIndicator style={styles.loader} />}
        {error && <ThemedText themeColor="textSecondary">{error}</ThemedText>}

        {launch && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {launch.links.patch.large && (
              <Image source={{ uri: launch.links.patch.large }} style={styles.patch} contentFit="contain" />
            )}

            <ThemedText type="title">{launch.name}</ThemedText>
            <ThemedText themeColor="textSecondary">{formatDate(launch.date_utc)}</ThemedText>

            <ThemedView type="backgroundElement" style={styles.badge}>
              <ThemedText type="small">{statusLabel(launch)}</ThemedText>
            </ThemedView>

            {launch.details && (
              <ThemedView style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary">Mission</ThemedText>
                <ThemedText>{launch.details}</ThemedText>
              </ThemedView>
            )}

            {launch.crew.length > 0 && (
              <ThemedView style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary">Crew</ThemedText>
                {launch.crew.map((member) => (
                  <ThemedView type="backgroundElement" key={member.crew.id} style={styles.crewRow}>
                    <ThemedText type="small">{member.crew.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {member.role} · {member.crew.agency}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four },
  backButton: { marginBottom: Spacing.three },
  loader: { marginTop: Spacing.four },
  scrollContent: { gap: Spacing.three, paddingBottom: Spacing.six },
  patch: { width: 160, height: 160, alignSelf: 'center' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  section: { gap: Spacing.two },
  crewRow: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
});
