import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Tab 3</Text>
    </View>
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
