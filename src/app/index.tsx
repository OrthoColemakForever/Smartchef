import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryColors, Colors, Spacing } from "@/constants/theme";
import { getAllRecipes } from "@/lib/database";
import { Recipe, RecipeCategory } from "@/lib/recipe-graph";
import { useSQLiteContext } from "expo-sqlite";
import { router, useFocusEffect } from "expo-router";
import { IconSearch } from "@/components/icons/icon-search";

const MIN_CARD_WIDTH = 220;
const CARD_GAP = Spacing.two;
const GRID_PADDING = Spacing.three;
const MAX_COLUMNS = 3;

const ALL_CATEGORIES: RecipeCategory[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "side",
  "dessert",
];

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
  const [selectedCategories, setSelectedCategories] = useState<
    RecipeCategory[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      async function loadRecipes() {
        const loaded = await getAllRecipes(db);
        setRecipes(loaded);
      }
      loadRecipes();
    }, [db]),
  );

  function toggleCategory(category: RecipeCategory) {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((existing) => existing !== category)
        : [...previous, category],
    );
  }

  const filteredRecipes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesSearch =
        query === "" ||
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(query),
        );

      const matchesCategory =
        selectedCategories.length === 0 ||
        recipe.categories.some((category) =>
          selectedCategories.includes(category),
        );

      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchText, selectedCategories]);

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
        contentContainerStyle={styles.categoryRowContent}
      >
        {ALL_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <Pressable
              key={category}
              onPress={() => toggleCategory(category)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected
                    ? CategoryColors[category]
                    : Colors.backgroundElement,
                  borderColor: isSelected
                    ? CategoryColors[category]
                    : Colors.backgroundSelected,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        key={numColumns}
        style={styles.container}
        contentContainerStyle={{ padding: GRID_PADDING, gap: CARD_GAP }}
        columnWrapperStyle={numColumns > 1 ? { gap: CARD_GAP } : undefined}
        data={filteredRecipes}
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
  categoryRow: {
    flexGrow: 0,
    paddingBottom: Spacing.two,
  },
  categoryRowContent: {
    gap: Spacing.two,
    paddingHorizontal: GRID_PADDING,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  categoryChipText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: "#ffffff",
  },
  searchInput: {
    flex: 1,
    fontSize: 42,
    color: Colors.text,
  },
});
