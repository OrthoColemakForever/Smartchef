import { SQLiteDatabase } from "expo-sqlite";

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
