import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { RecipeForm } from "@/components/recipe-form";
import { saveRecipe } from "@/lib/database";
import { Recipe } from "@/lib/recipe-graph";

export default function NewRecipeScreen() {
  const db = useSQLiteContext();

  async function handleSubmit(recipe: Recipe) {
    await saveRecipe(db, recipe);
    router.back();
  }

  return (
    <RecipeForm editable submitLabel="Save Recipe" onSubmit={handleSubmit} />
  );
}
