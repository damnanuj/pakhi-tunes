import { View, Text, StyleSheet } from "react-native";
import TabScreenWrapper from "src/components/common/TabScreenWrapper";

export default function SettingsScreen() {
  return (
    <TabScreenWrapper>
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Tab 4</Text>
    </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
});
