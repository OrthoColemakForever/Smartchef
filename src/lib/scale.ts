import { Recipe } from "./recipe-graph";

export function scale(recipe: Recipe, multiplier: number): Recipe {
  const scaledIngredients = [];
  const scaledSubstitutions = [];

  for (const ingredient of recipe.ingredients) {
    const base_amount = ingredient.amount;
    const scaledIngredient = { ...ingredient };
    if (base_amount !== null) {
      scaledIngredient.amount = base_amount * multiplier;
    }
    scaledIngredients.push(scaledIngredient);
  }

  for (const substitution of recipe.substitutions) {
    const base_amount = substitution.newIngredient.amount;
    const scaledSubIngredient = { ...substitution.newIngredient };
    if (base_amount !== null) {
      scaledSubIngredient.amount = base_amount * multiplier;
    }
    scaledSubstitutions.push({
      ...substitution,
      newIngredient: scaledSubIngredient,
    });
  }

  const scaledRecipe: Recipe = {
    id: recipe.id,
    name: recipe.name,
    type: recipe.type,
    servings: recipe.servings * multiplier,
    ingredients: scaledIngredients,
    instructions: recipe.instructions,
    substitutions: scaledSubstitutions,
  };

  return scaledRecipe;
}
