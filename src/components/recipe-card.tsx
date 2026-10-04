import { StyleSheet, Text, View } from "react-native";
import { Recipe } from "@/lib/recipe-graph";
import { Colors, Spacing } from "@/constants/theme";

type RecipeCardProps = { recipe: Recipe };

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <View style={styles.card}>
      <Text>{recipe.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: Colors.backgroundElement,
    width: 240,
    aspectRatio: 1.4,
  },
});
