import { FlatList, StyleSheet, Text, View } from "react-native";
import { Recipe } from "@/lib/recipe-graph";
import { RecipeCard } from "@/components/recipe-card";

const recipes: Recipe[] = [
  {
    id: "r1",
    name: "Spaghetti",
    categories: ["dinner"],
    servings: 6,
    ingredients: [{ id: "i1", name: "pasta", amount: 1, unit: null }],
    highlightIngredientIDs: ["i1"],
    instructions: [],
    substitutions: [],
  },
  {
    id: "r2",
    name: "Baked Mashed Potatoes",
    categories: ["side"],
    servings: 8,
    ingredients: [{ id: "i2", name: "potato", amount: 3, unit: null }],
    highlightIngredientIDs: ["i2"],
    instructions: [],
    substitutions: [],
  },
  {
    id: "r3",
    name: "Apple Bourbon Chicken",
    categories: ["dinner"],
    servings: 4,
    ingredients: [{ id: "i3", name: "chicken breasts", amount: 4, unit: null }],
    highlightIngredientIDs: ["i3"],
    instructions: [],
    substitutions: [],
  },
  {
    id: "r4",
    name: "Brownies",
    categories: ["dessert"],
    servings: 12,
    ingredients: [{ id: "i4", name: "choclate chips", amount: 1, unit: null }],
    highlightIngredientIDs: ["i4"],
    instructions: [],
    substitutions: [],
  },
];

export default function RecipeGrid() {
  return (
    <FlatList
      style={styles.container}
      data={recipes}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
