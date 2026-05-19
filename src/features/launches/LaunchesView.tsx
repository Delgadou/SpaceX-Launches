import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Observer } from "mobx-react-lite";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LaunchesModel from "./LaunchesModel";
import LaunchCard from "./components/LaunchCard";
import SegmentedControl from "./components/SegmentedControl";

interface Props {
  model: LaunchesModel;
}

export default function LaunchesView({ model }: Props) {
  const router = useRouter();

  useEffect(() => {
    model.fetchAll();
  }, [model]);

  return (
    <Observer>
      {() => (
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <ThemedText type="subtitle" style={styles.title}>
              Launches
            </ThemedText>

            <SegmentedControl
              selected={model.selectedTab}
              onChange={(tab) => model.selectTab(tab)}
            />

            {model.loading && <ActivityIndicator style={styles.loader} />}
            {model.error && (
              <ThemedText themeColor="textSecondary">{model.error}</ThemedText>
            )}

            <FlatList
              data={model.data}
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
      )}
    </Observer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  title: { marginBottom: Spacing.three },
  loader: { marginTop: Spacing.four },
  list: { gap: Spacing.two, paddingBottom: Spacing.six },
});
