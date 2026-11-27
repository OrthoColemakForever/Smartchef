import { ImageSourcePropType } from "react-native";

// Bundled photos for the seed/starter recipes (src/lib/seed-recipes.ts) — a
// recipe's imageUri holds one of these keys instead of a real URI when it's
// using bundled dummy data rather than a user-picked photo.
export const RECIPE_IMAGES: Record<string, ImageSourcePropType> = {
  cheeseburger: require("@/assets/images/recipes/cheeseburger.png"),
  "mac-and-cheese": require("@/assets/images/recipes/mac-and-cheese.png"),
  spaghetti: require("@/assets/images/recipes/spaghetti.png"),
  meatloaf: require("@/assets/images/recipes/meatloaf.png"),
  "buttermilk-pancakes": require("@/assets/images/recipes/buttermilk-pancakes.png"),
  "french-toast": require("@/assets/images/recipes/french-toast.png"),
  "chocolate-chip-cookies": require("@/assets/images/recipes/chocolate-chip-cookies.png"),
  "apple-pie": require("@/assets/images/recipes/apple-pie.png"),
  "pimento-grilled-cheese": require("@/assets/images/recipes/pimento-grilled-cheese.png"),
  "philly-cheesesteak": require("@/assets/images/recipes/philly-cheesesteak.png"),
  "baked-beans": require("@/assets/images/recipes/baked-beans.png"),
  "potato-salad": require("@/assets/images/recipes/potato-salad.png"),
  "bacon-hashbrown-bowl": require("@/assets/images/recipes/bacon-hashbrown-bowl.png"),
  "fried-catfish": require("@/assets/images/recipes/fried-catfish.png"),
  "baby-back-ribs": require("@/assets/images/recipes/baby-back-ribs.png"),
  "sloppy-joes": require("@/assets/images/recipes/sloppy-joes.png"),
  "chicken-fried-steak": require("@/assets/images/recipes/chicken-fried-steak.png"),
};

export function resolveRecipeImageSource(
  imageUri: string | undefined,
): ImageSourcePropType | undefined {
  if (!imageUri) return undefined;
  return RECIPE_IMAGES[imageUri] ?? { uri: imageUri };
}
