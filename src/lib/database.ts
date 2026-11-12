import { randomUUID } from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";
import { Recipe } from "@/lib/recipe-graph";

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

export async function saveRecipe(
  db: SQLiteDatabase,
  recipe: Recipe,
): Promise<void> {
  await db.runAsync(
    "INSERT INTO recipes (id, name, image_uri, servings) VALUES (?, ?, ?, ?)",
    [recipe.id, recipe.name, recipe.imageUri ?? null, recipe.servings],
  );

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
