import { randomUUID } from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";
import { Ingredient, Recipe, RecipeCategory, Step, Substitution, Unit } from "@/lib/recipe-graph";

export async function setupDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      image_uri       TEXT,
      servings        INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipe_categories (
      recipe_id       TEXT NOT NULL REFERENCES recipes(id),
      category        TEXT NOT NULL,
      PRIMARY KEY (recipe_id, category)
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id              TEXT PRIMARY KEY,
      recipe_id       TEXT NOT NULL REFERENCES recipes(id),
      name            TEXT NOT NULL,
      amount          REAL,
      unit            TEXT,
      is_highlighted  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS steps (
      id              TEXT PRIMARY KEY,
      recipe_id       TEXT NOT NULL REFERENCES recipes(id),
      step_index      INTEGER NOT NULL,
      command         TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS step_ingredients (
      step_id         TEXT NOT NULL REFERENCES steps(id),
      ingredient_id   TEXT NOT NULL REFERENCES ingredients(id),
      PRIMARY KEY (step_id, ingredient_id)
    );

    CREATE TABLE IF NOT EXISTS substitutions (
      id                      TEXT PRIMARY KEY,
      old_ingredient_id       TEXT NOT NULL REFERENCES ingredients(id),
      beginning_with_step_id  TEXT NOT NULL REFERENCES steps(id),
      new_ingredient_name     TEXT NOT NULL,
      new_ingredient_amount   REAL,
      new_ingredient_unit     TEXT
    );
  `);
}

// Inserts everything *except* the recipes row itself — shared by saveRecipe
// (fresh insert) and updateRecipe (re-insert after clearing old child rows).
async function insertRecipeChildren(
  db: SQLiteDatabase,
  recipe: Recipe,
): Promise<void> {
  for (const category of recipe.categories) {
    await db.runAsync(
      "INSERT INTO recipe_categories (recipe_id, category) VALUES (?, ?)",
      [recipe.id, category],
    );
  }

  for (const ingredient of recipe.ingredients) {
    const isHighlighted = recipe.highlightIngredientIDs.includes(ingredient.id);
    await db.runAsync(
      "INSERT INTO ingredients (id, recipe_id, name, amount, unit, is_highlighted) VALUES (?, ?, ?, ?, ?, ?)",
      [
        ingredient.id,
        recipe.id,
        ingredient.name,
        ingredient.amount,
        ingredient.unit,
        isHighlighted ? 1 : 0,
      ],
    );
  }

  for (const step of recipe.steps) {
    await db.runAsync(
      "INSERT INTO steps (id, recipe_id, step_index, command) VALUES (?, ?, ?, ?)",
      [step.id, recipe.id, step.index, step.command],
    );

    for (const ingredientId of step.usesIngredientIDs) {
      await db.runAsync(
        "INSERT INTO step_ingredients (step_id, ingredient_id) VALUES (?, ?)",
        [step.id, ingredientId],
      );
    }
  }

  for (const substitution of recipe.substitutions) {
    await db.runAsync(
      `INSERT INTO substitutions (id, old_ingredient_id, beginning_with_step_id,
      new_ingredient_name, new_ingredient_amount, new_ingredient_unit) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        substitution.oldIngredientID,
        substitution.beginningWithStepID,
        substitution.newIngredient.name,
        substitution.newIngredient.amount,
        substitution.newIngredient.unit,
      ],
    );
  }
}

// Clears every child row for a recipe, in dependency order (step_ingredients
// and substitutions reference both steps and ingredients, so they have to go
// first) — shared by updateRecipe (clear-then-reinsert) and deleteRecipe.
async function deleteRecipeChildren(
  db: SQLiteDatabase,
  recipeId: string,
): Promise<void> {
  await db.runAsync(
    "DELETE FROM step_ingredients WHERE step_id IN (SELECT id FROM steps WHERE recipe_id = ?)",
    [recipeId],
  );
  await db.runAsync(
    "DELETE FROM substitutions WHERE old_ingredient_id IN (SELECT id FROM ingredients WHERE recipe_id = ?)",
    [recipeId],
  );
  await db.runAsync("DELETE FROM steps WHERE recipe_id = ?", [recipeId]);
  await db.runAsync("DELETE FROM ingredients WHERE recipe_id = ?", [recipeId]);
  await db.runAsync("DELETE FROM recipe_categories WHERE recipe_id = ?", [
    recipeId,
  ]);
}

export async function saveRecipe(
  db: SQLiteDatabase,
  recipe: Recipe,
): Promise<void> {
  await db.runAsync(
    "INSERT INTO recipes (id, name, image_uri, servings) VALUES (?, ?, ?, ?)",
    [recipe.id, recipe.name, recipe.imageUri ?? null, recipe.servings],
  );

  await insertRecipeChildren(db, recipe);
}

export async function updateRecipe(
  db: SQLiteDatabase,
  recipe: Recipe,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE recipes SET name = ?, image_uri = ?, servings = ? WHERE id = ?",
      [recipe.name, recipe.imageUri ?? null, recipe.servings, recipe.id],
    );

    await deleteRecipeChildren(db, recipe.id);
    await insertRecipeChildren(db, recipe);
  });
}

export async function deleteRecipe(
  db: SQLiteDatabase,
  recipeId: string,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await deleteRecipeChildren(db, recipeId);
    await db.runAsync("DELETE FROM recipes WHERE id = ?", [recipeId]);
  });
}

type RecipeRow = {
  id: string;
  name: string;
  image_uri: string | null;
  servings: number;
};

// Loads everything else a recipe needs (categories, ingredients, steps,
// substitutions) given its base row — shared by getAllRecipes/getRecipeById.
async function loadRecipeFromRow(
  db: SQLiteDatabase,
  recipeRow: RecipeRow,
): Promise<Recipe> {
  const categoryRows = await db.getAllAsync<{ category: RecipeCategory }>(
    "SELECT category FROM recipe_categories WHERE recipe_id = ?",
    [recipeRow.id],
  );

  const ingredientRows = await db.getAllAsync<{
    id: string;
    name: string;
    amount: number | null;
    unit: Unit;
    is_highlighted: number;
  }>("SELECT * FROM ingredients WHERE recipe_id = ?", [recipeRow.id]);

  const ingredients: Ingredient[] = ingredientRows.map((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    unit: row.unit,
  }));

  const highlightIngredientIDs = ingredientRows
    .filter((row) => row.is_highlighted === 1)
    .map((row) => row.id);

  const stepRows = await db.getAllAsync<{
    id: string;
    step_index: number;
    command: string;
  }>("SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_index", [recipeRow.id]);

  const steps: Step[] = [];
  for (const stepRow of stepRows) {
    const stepIngredientRows = await db.getAllAsync<{ ingredient_id: string }>(
      "SELECT ingredient_id FROM step_ingredients WHERE step_id = ?",
      [stepRow.id],
    );

    steps.push({
      id: stepRow.id,
      index: stepRow.step_index,
      command: stepRow.command,
      usesIngredientIDs: stepIngredientRows.map((row) => row.ingredient_id),
    });
  }

  const substitutionRows = await db.getAllAsync<{
    old_ingredient_id: string;
    beginning_with_step_id: string;
    new_ingredient_name: string;
    new_ingredient_amount: number | null;
    new_ingredient_unit: Unit;
  }>(
    `SELECT substitutions.* FROM substitutions
     JOIN ingredients ON substitutions.old_ingredient_id = ingredients.id
     WHERE ingredients.recipe_id = ?`,
    [recipeRow.id],
  );

  const substitutions: Substitution[] = substitutionRows.map((row) => ({
    oldIngredientID: row.old_ingredient_id,
    beginningWithStepID: row.beginning_with_step_id,
    newIngredient: {
      name: row.new_ingredient_name,
      amount: row.new_ingredient_amount,
      unit: row.new_ingredient_unit,
    },
  }));

  return {
    id: recipeRow.id,
    name: recipeRow.name,
    imageUri: recipeRow.image_uri ?? undefined,
    categories: categoryRows.map((row) => row.category),
    servings: recipeRow.servings,
    ingredients: ingredients,
    highlightIngredientIDs: highlightIngredientIDs,
    steps: steps,
    substitutions: substitutions,
  };
}

export async function getAllRecipes(db: SQLiteDatabase): Promise<Recipe[]> {
  const recipeRows = await db.getAllAsync<RecipeRow>("SELECT * FROM recipes");

  const recipes: Recipe[] = [];
  for (const recipeRow of recipeRows) {
    recipes.push(await loadRecipeFromRow(db, recipeRow));
  }

  return recipes;
}

export async function getRecipeById(
  db: SQLiteDatabase,
  recipeId: string,
): Promise<Recipe | null> {
  const recipeRow = await db.getFirstAsync<RecipeRow>(
    "SELECT * FROM recipes WHERE id = ?",
    [recipeId],
  );

  if (!recipeRow) {
    return null;
  }

  return loadRecipeFromRow(db, recipeRow);
}
