import { Recipe } from "./recipe-graph";

export function scale(recipe: Recipe, multiplier: number): Recipe {
  const scaledIngredients = [];

  for (const ingredient of recipe.ingredients) {
    const base_amount = ingredient.amount;
    const scaledIngredient = { ...ingredient };
    if (base_amount !== null) {
      scaledIngredient.amount = base_amount * multiplier;
    }
    scaledIngredients.push(scaledIngredient);
  }

  const scaledRecipe: Recipe = {
    id: recipe.id,
    name: recipe.name,
    type: recipe.type,
    servings: recipe.servings * multiplier,
    ingredients: scaledIngredients,
    instructions: recipe.instructions,
    substitutions: recipe.substitutions,
  };

  return scaledRecipe;
}
