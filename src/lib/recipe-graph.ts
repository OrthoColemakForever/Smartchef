export interface Recipe {
  id: string;
  name: string;
  imageUri?: string;
  categories: RecipeCategory[];
  servings: number;
  ingredients: Ingredient[];
  highlightIngredientIDs: string[];
  instructions: Step[];
  substitutions: Substitution[];
}

export type RecipeCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "side"
  | "dessert";

export interface Ingredient {
  id: string;
  name: string;
  amount: number | null;
  unit: Unit;
}

export interface NewIngredient {
  name: string;
  amount: number | null;
  unit: Unit;
}

export interface Substitution {
  newIngredient: NewIngredient;
  oldIngredientID: string;
  beginningWithStepID: string;
}

export interface Step {
  id: string;
  index: number;
  usesIngredientIDs: string[];
  command: string;
}

export type Unit =
  | "tsp"
  | "tbsp"
  | "fl oz"
  | "cup"
  | "pint"
  | "quart"
  | "gallon"
  | "oz"
  | "can"
  | "slice"
  | "clove"
  | "half"
  | null;
