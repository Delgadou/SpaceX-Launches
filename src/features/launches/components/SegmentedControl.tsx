import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Tab } from '../LaunchesModel';

interface Props {
  selected: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: Tab[] = ['launched', 'upcoming'];
const LABELS: Record<Tab, string> = { launched: 'Launched', upcoming: 'Upcoming' };

export default function SegmentedControl({ selected, onChange }: Props) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {TABS.map((tab) => (
        <Pressable key={tab} style={styles.item} onPress={() => onChange(tab)}>
          <ThemedView
            style={[styles.segment, selected === tab && { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor={selected === tab ? 'text' : 'textSecondary'}>
              {LABELS[tab]}
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
    marginBottom: Spacing.three,
  },
  item: { flex: 1 },
  segment: {
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    alignItems: 'center',
  },
});
