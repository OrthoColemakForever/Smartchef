import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useCallback, useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { Colors, Spacing } from "@/constants/theme";
import { getAllRecipes } from "@/lib/database";
import { Recipe } from "@/lib/recipe-graph";
import { useSQLiteContext } from "expo-sqlite";
import { router, useFocusEffect } from "expo-router";
import { IconSearch } from "@/components/icons/icon-search";

export const sampleRecipes: Recipe[] = [
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
    steps: [],
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
    steps: [],
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
    steps: [],
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
    steps: [],
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
  const db = useSQLiteContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function loadRecipes() {
        const loaded = await getAllRecipes(db);
        setRecipes(loaded);
      }
      loadRecipes();
    }, [db]),
  );

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <IconSearch size={40} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search recipes"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        key={numColumns}
        style={styles.container}
        contentContainerStyle={{ padding: GRID_PADDING, gap: CARD_GAP }}
        columnWrapperStyle={numColumns > 1 ? { gap: CARD_GAP } : undefined}
        data={recipes}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/recipe/${item.id}`)}>
            <RecipeCard recipe={item} width={cardWidth} />
          </Pressable>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: GRID_PADDING,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.two,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.backgroundSelected,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 42,
    color: Colors.text,
  },
});
