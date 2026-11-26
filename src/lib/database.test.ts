import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import {
  deleteRecipe,
  getAllRecipes,
  getRecipeById,
  saveRecipe,
  setupDatabase,
  updateRecipe,
} from "@/lib/database";
import { Recipe } from "@/lib/recipe-graph";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    name: "Spaghetti",
    imageUri: "https://example.com/spaghetti.jpg",
    categories: ["dinner", "lunch"],
    servings: 4,
    ingredients: [
      { id: "ing-1", name: "pasta", amount: 1, unit: null },
      { id: "ing-2", name: "marinara", amount: 2, unit: "cup" },
    ],
    highlightIngredientIDs: ["ing-1"],
    steps: [
      {
        id: "step-1",
        index: 0,
        command: "Boil the pasta",
        usesIngredientIDs: ["ing-1"],
      },
      {
        id: "step-2",
        index: 1,
        command: "Add the sauce",
        usesIngredientIDs: ["ing-2"],
      },
    ],
    substitutions: [
      {
        oldIngredientID: "ing-2",
        beginningWithStepID: "step-2",
        newIngredient: { name: "alfredo", amount: 2, unit: "cup" },
      },
    ],
    ...overrides,
  };
}

let db: SQLiteDatabase;

beforeEach(async () => {
  process.env.EXPO_SQLITE_MOCK = `${__dirname}/test_${process.env.JEST_WORKER_ID}_${Date.now()}_${Math.random()}.db`;
  db = await openDatabaseAsync("test.db");
  await setupDatabase(db);
});

afterEach(() => {
  delete process.env.EXPO_SQLITE_MOCK;
});

describe("setupDatabase", () => {
  it("can be called more than once without error", async () => {
    await expect(setupDatabase(db)).resolves.not.toThrow();
  });
});

describe("saveRecipe + getAllRecipes", () => {
  it("round-trips every field of a full recipe", async () => {
    await saveRecipe(db, makeRecipe());

    const recipes = await getAllRecipes(db);
    expect(recipes).toHaveLength(1);

    const [recipe] = recipes;
    expect(recipe.id).toBe("recipe-1");
    expect(recipe.name).toBe("Spaghetti");
    expect(recipe.imageUri).toBe("https://example.com/spaghetti.jpg");
    expect(recipe.servings).toBe(4);
    expect(recipe.categories.sort()).toEqual(["dinner", "lunch"]);
    expect(recipe.ingredients).toEqual([
      { id: "ing-1", name: "pasta", amount: 1, unit: null },
      { id: "ing-2", name: "marinara", amount: 2, unit: "cup" },
    ]);
    expect(recipe.highlightIngredientIDs).toEqual(["ing-1"]);
    expect(recipe.steps).toEqual([
      {
        id: "step-1",
        index: 0,
        command: "Boil the pasta",
        usesIngredientIDs: ["ing-1"],
      },
      {
        id: "step-2",
        index: 1,
        command: "Add the sauce",
        usesIngredientIDs: ["ing-2"],
      },
    ]);
    expect(recipe.substitutions).toEqual([
      {
        oldIngredientID: "ing-2",
        beginningWithStepID: "step-2",
        newIngredient: { name: "alfredo", amount: 2, unit: "cup" },
      },
    ]);
  });

  it("preserves step order via step_index, regardless of insert order", async () => {
    const recipe = makeRecipe({
      steps: [
        { id: "step-2", index: 1, command: "second", usesIngredientIDs: [] },
        { id: "step-1", index: 0, command: "first", usesIngredientIDs: [] },
      ],
    });
    await saveRecipe(db, recipe);

    const [loaded] = await getAllRecipes(db);
    expect(loaded.steps.map((step) => step.command)).toEqual([
      "first",
      "second",
    ]);
  });

  it("keeps separate recipes' data from bleeding into each other", async () => {
    await saveRecipe(db, makeRecipe({ id: "recipe-1", name: "Spaghetti" }));
    await saveRecipe(
      db,
      makeRecipe({
        id: "recipe-2",
        name: "Tacos",
        ingredients: [{ id: "ing-3", name: "tortilla", amount: 2, unit: null }],
        highlightIngredientIDs: ["ing-3"],
        steps: [],
        substitutions: [],
      }),
    );

    const recipes = await getAllRecipes(db);
    expect(recipes).toHaveLength(2);

    const tacos = recipes.find((recipe) => recipe.id === "recipe-2")!;
    expect(tacos.name).toBe("Tacos");
    expect(tacos.ingredients).toEqual([
      { id: "ing-3", name: "tortilla", amount: 2, unit: null },
    ]);

    const spaghetti = recipes.find((recipe) => recipe.id === "recipe-1")!;
    expect(spaghetti.ingredients.map((i) => i.name)).toEqual([
      "pasta",
      "marinara",
    ]);
  });

  it("handles an empty highlightIngredientIDs/steps/substitutions recipe", async () => {
    await saveRecipe(
      db,
      makeRecipe({
        highlightIngredientIDs: [],
        steps: [],
        substitutions: [],
      }),
    );

    const [recipe] = await getAllRecipes(db);
    expect(recipe.highlightIngredientIDs).toEqual([]);
    expect(recipe.steps).toEqual([]);
    expect(recipe.substitutions).toEqual([]);
  });

  it("stores a missing imageUri as undefined, not null or empty string", async () => {
    const recipe = makeRecipe();
    delete recipe.imageUri;
    await saveRecipe(db, recipe);

    const [loaded] = await getAllRecipes(db);
    expect(loaded.imageUri).toBeUndefined();
  });
});

describe("getRecipeById", () => {
  it("finds the matching recipe by id", async () => {
    await saveRecipe(db, makeRecipe({ id: "recipe-1", name: "Spaghetti" }));
    await saveRecipe(
      db,
      makeRecipe({
        id: "recipe-2",
        name: "Tacos",
        ingredients: [{ id: "ing-3", name: "tortilla", amount: 2, unit: null }],
        highlightIngredientIDs: [],
        steps: [],
        substitutions: [],
      }),
    );

    const recipe = await getRecipeById(db, "recipe-2");
    expect(recipe?.name).toBe("Tacos");
  });

  it("returns null for an id that doesn't exist", async () => {
    const recipe = await getRecipeById(db, "does-not-exist");
    expect(recipe).toBeNull();
  });
});

describe("updateRecipe", () => {
  it("updates the recipe's own fields", async () => {
    await saveRecipe(db, makeRecipe());
    await updateRecipe(
      db,
      makeRecipe({ name: "Spaghetti Bolognese", servings: 6 }),
    );

    const recipe = await getRecipeById(db, "recipe-1");
    expect(recipe?.name).toBe("Spaghetti Bolognese");
    expect(recipe?.servings).toBe(6);
  });

  it("replaces ingredients cleanly when the count shrinks", async () => {
    await saveRecipe(db, makeRecipe());
    await updateRecipe(
      db,
      makeRecipe({
        ingredients: [{ id: "ing-1", name: "pasta", amount: 2, unit: null }],
        highlightIngredientIDs: ["ing-1"],
        steps: [],
        substitutions: [],
      }),
    );

    const recipe = await getRecipeById(db, "recipe-1");
    expect(recipe?.ingredients).toEqual([
      { id: "ing-1", name: "pasta", amount: 2, unit: null },
    ]);
  });

  it("replaces ingredients cleanly when the count grows", async () => {
    await saveRecipe(db, makeRecipe());
    await updateRecipe(
      db,
      makeRecipe({
        ingredients: [
          { id: "ing-1", name: "pasta", amount: 1, unit: null },
          { id: "ing-2", name: "marinara", amount: 2, unit: "cup" },
          { id: "ing-4", name: "basil", amount: 1, unit: "tbsp" },
        ],
      }),
    );

    const recipe = await getRecipeById(db, "recipe-1");
    expect(recipe?.ingredients.map((i) => i.name)).toEqual([
      "pasta",
      "marinara",
      "basil",
    ]);
  });

  it("does not create a second recipe row", async () => {
    await saveRecipe(db, makeRecipe());
    await updateRecipe(db, makeRecipe({ name: "Updated" }));

    const recipes = await getAllRecipes(db);
    expect(recipes).toHaveLength(1);
  });

  it("rolls back entirely if something in the transaction fails", async () => {
    await saveRecipe(db, makeRecipe({ id: "recipe-1" }));
    // "ing-9" belongs to recipe-2 — ingredients.id is a primary key, so
    // reusing it below is a genuine constraint violation, not a simulated one.
    await saveRecipe(
      db,
      makeRecipe({
        id: "recipe-2",
        ingredients: [{ id: "ing-9", name: "salt", amount: null, unit: null }],
        highlightIngredientIDs: [],
        steps: [],
        substitutions: [],
      }),
    );

    const broken = makeRecipe({
      id: "recipe-1",
      name: "Should Not Stick",
      ingredients: [{ id: "ing-9", name: "collides", amount: 1, unit: null }],
    });

    await expect(updateRecipe(db, broken)).rejects.toThrow();

    const recipe = await getRecipeById(db, "recipe-1");
    expect(recipe?.name).toBe("Spaghetti");
    expect(recipe?.ingredients.map((i) => i.name)).toEqual([
      "pasta",
      "marinara",
    ]);
  });
});

describe("deleteRecipe", () => {
  it("removes the recipe itself", async () => {
    await saveRecipe(db, makeRecipe());
    await deleteRecipe(db, "recipe-1");

    expect(await getRecipeById(db, "recipe-1")).toBeNull();
  });

  it("leaves other recipes untouched", async () => {
    await saveRecipe(db, makeRecipe({ id: "recipe-1" }));
    await saveRecipe(
      db,
      makeRecipe({
        id: "recipe-2",
        name: "Tacos",
        ingredients: [{ id: "ing-3", name: "tortilla", amount: 2, unit: null }],
        highlightIngredientIDs: [],
        steps: [],
        substitutions: [],
      }),
    );

    await deleteRecipe(db, "recipe-1");

    const recipes = await getAllRecipes(db);
    expect(recipes).toHaveLength(1);
    expect(recipes[0].name).toBe("Tacos");
  });

  it("doesn't leave orphaned child rows behind (no data bleeds into a later recipe)", async () => {
    await saveRecipe(db, makeRecipe({ id: "recipe-1" }));
    await deleteRecipe(db, "recipe-1");

    // If step_ingredients/substitutions/ingredients/steps weren't actually
    // cleared, a later recipe reusing the same ids could pick up stale rows.
    await saveRecipe(
      db,
      makeRecipe({
        id: "recipe-1",
        name: "Reused Id",
        ingredients: [{ id: "ing-1", name: "flour", amount: 1, unit: "cup" }],
        highlightIngredientIDs: [],
        steps: [],
        substitutions: [],
      }),
    );

    const recipe = await getRecipeById(db, "recipe-1");
    expect(recipe?.name).toBe("Reused Id");
    expect(recipe?.ingredients).toEqual([
      { id: "ing-1", name: "flour", amount: 1, unit: "cup" },
    ]);
    expect(recipe?.steps).toEqual([]);
    expect(recipe?.substitutions).toEqual([]);
  });
});
