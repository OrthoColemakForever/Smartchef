import { FlatList, StyleSheet, Text, View } from "react-native";

const recipes = [
  "Spaghetti",
  "Baked Mashed Potatoes",
  "Apple Bourbon Chicken",
  "Brownies",
];

export default function RecipeGrid() {
  return (
    <FlatList
      style={styles.container}
      data={recipes}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text>{item}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
