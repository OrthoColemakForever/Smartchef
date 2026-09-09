export interface Recipe {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  servings: number;
  ingredients: Ingredient[];
  instructions: Step[];
  substitutions: Substitution[];
}

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
  | null;
