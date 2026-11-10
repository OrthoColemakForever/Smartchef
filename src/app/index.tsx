import { FlatList, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Colors, Spacing } from "@/constants/theme";
import { Recipe } from "@/lib/recipe-graph";
import { RecipeCard } from "@/components/recipe-card";

const recipes: Recipe[] = [
  {
    id: "r1",
    name: "Spaghetti",
    imageUri: "https://picsum.photos/seed/r1-spaghetti/600/450",
    categories: ["dinner"],
    servings: 6,
    ingredients: [
      { id: "i1", name: "pasta", amount: 1, unit: null },
      { id: "i1b", name: "marinara", amount: 2, unit: "cup" },
      { id: "i1c", name: "parmesan", amount: 0.5, unit: "cup" },
    ],
    highlightIngredientIDs: ["i1", "i1b", "i1c"],
    instructions: [],
    substitutions: [],
  },
  {
    id: "r2",
    name: "Baked Mashed Potatoes",
    imageUri: "https://picsum.photos/seed/r2-potatoes/600/450",
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
    imageUri: "https://picsum.photos/seed/r3-chicken/600/450",
    categories: ["dinner", "lunch"],
    servings: 4,
    ingredients: [{ id: "i3", name: "chicken breasts", amount: 4, unit: null }],
    highlightIngredientIDs: ["i3"],
    instructions: [],
    substitutions: [],
  },
  {
    id: "r4",
    name: "Brownies",
    imageUri: "https://picsum.photos/seed/r4-brownies/600/450",
    categories: ["dessert", "snack"],
    servings: 12,
    ingredients: [{ id: "i4", name: "chocolate chips", amount: 1, unit: null }],
    highlightIngredientIDs: ["i4"],
    instructions: [],
    substitutions: [],
  },
];

const MIN_CARD_WIDTH = 220;
const CARD_GAP = Spacing.two;
const GRID_PADDING = Spacing.three;
const MAX_COLUMNS = 3;

export default function RecipeGrid() {
  const [containerWidth, setContainerWidth] = useState(0);
  const availableWidth = containerWidth - GRID_PADDING * 2;
  const numColumns = Math.min(
    MAX_COLUMNS,
    Math.max(
      1,
      Math.floor((availableWidth + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP)),
    ),
  );
  const cardWidth = (availableWidth - CARD_GAP * (numColumns - 1)) / numColumns;
  return (
    <View
      style={{ flex: 1 }}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <FlatList
        key={numColumns}
        style={styles.container}
        contentContainerStyle={{ padding: GRID_PADDING, gap: CARD_GAP }}
        columnWrapperStyle={numColumns > 1 ? { gap: CARD_GAP } : undefined}
        data={recipes}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} width={cardWidth} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
