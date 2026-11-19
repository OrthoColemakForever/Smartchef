import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Recipe } from "@/lib/recipe-graph";
import { Colors, Spacing } from "@/constants/theme";

type RecipeCardProps = { recipe: Recipe; width: number };

const MAX_VISIBLE_CATEGORIES = 2;
const MAX_VISIBLE_CHIPS = 5;

export function RecipeCard({ recipe, width }: RecipeCardProps) {
  // `ingredients` only has id/name/amount/unit — `highlightIngredientIDs` is just a
  // list of strings. To actually show chip text, look up each id against the real
  // ingredients and keep only the ones that match. `.filter()` walks the array and
  // keeps whatever the callback returns `true` for.
  const highlightedIngredients = recipe.ingredients
    .filter((ingredient) =>
      recipe.highlightIngredientIDs.includes(ingredient.id),
    )
    .slice(0, MAX_VISIBLE_CHIPS);

  const visibleCategories = recipe.categories.slice(0, MAX_VISIBLE_CATEGORIES);

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.imageArea}>
        {recipe.imageUri ? (
          <Image
            source={recipe.imageUri}
            style={styles.image}
            contentFit="cover"
          />
        ) : null}

        {visibleCategories.length > 0 && (
          <View style={styles.categoryRow}>
            {visibleCategories.map((category) => (
              <View key={category} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{category}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {recipe.name}
        </Text>

        {highlightedIngredients.length > 0 && (
          <View style={styles.chipRow}>
            {highlightedIngredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.chip}>
                <Text style={styles.chipText}>{ingredient.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: Colors.backgroundElement,
    aspectRatio: 1.4,
  },
  imageArea: {
    flex: 3,
    backgroundColor: Colors.backgroundSelected,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryRow: {
    position: "absolute",
    top: Spacing.one,
    left: Spacing.one,
    flexDirection: "row",
    gap: Spacing.half,
  },
  categoryChip: {
    backgroundColor: "rgba(17, 20, 23, 0.55)",
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  categoryChipText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  content: {
    flex: 1,
    padding: Spacing.two,
    justifyContent: "center",
    gap: Spacing.half,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.half,
  },
  chip: {
    backgroundColor: Colors.backgroundSelected,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  chipText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: "500",
  },
});
