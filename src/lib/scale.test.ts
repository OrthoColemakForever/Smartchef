import * as Crypto from "expo-crypto";
import * as RecipeTyping from "./recipe-graph";
import { scale } from "./scale";

const bread: RecipeTyping.Ingredient = {
  id: Crypto.randomUUID(),
  name: "bread",
  amount: 2,
  unit: null,
};

const bacon: RecipeTyping.Ingredient = {
  id: Crypto.randomUUID(),
  name: "bacon",
  amount: 3,
  unit: null,
};

const lettuce: RecipeTyping.Ingredient = {
  id: Crypto.randomUUID(),
  name: "lettuce",
  amount: 1,
  unit: null,
};

const salt: RecipeTyping.Ingredient = {
  id: Crypto.randomUUID(),
  name: "salt",
  amount: null,
  unit: null,
};

const pepper: RecipeTyping.Ingredient = {
  id: Crypto.randomUUID(),
  name: "pepper",
  amount: 1,
  unit: "tsp",
};

const tomato: RecipeTyping.Ingredient = {
  id: Crypto.randomUUID(),
  name: "tomato",
  amount: 1,
  unit: null,
};

const toastBread: RecipeTyping.Step = {
  id: Crypto.randomUUID(),
  index: 0,
  usesIngredientIDs: [bread.id],
  command: "Toast 2 slices of bread.",
};

const prepIngredients: RecipeTyping.Step = {
  id: Crypto.randomUUID(),
  index: 1,
  usesIngredientIDs: [lettuce.id, bacon.id, tomato.id],
  command: "Cook bacon, slice tomato, and pull apart lettuce.",
};

const assembleSandwich: RecipeTyping.Step = {
  id: Crypto.randomUUID(),
  index: 2,
  usesIngredientIDs: [
    bread.id,
    lettuce.id,
    bacon.id,
    salt.id,
    pepper.id,
    tomato.id,
  ],
  command: "Layer ingredients between bread slices and enjoy.",
};

const turkeyBacon: RecipeTyping.NewIngredient = {
  name: "turkey_bacon",
  amount: 3,
  unit: null,
};

const subTurkeyBacon: RecipeTyping.Substitution = {
  newIngredient: turkeyBacon,
  oldIngredientID: bacon.id,
  beginningWithStepID: prepIngredients.id,
};

const blt: RecipeTyping.Recipe = {
  id: Crypto.randomUUID(),
  name: "BLT Sandwich",
  type: "lunch",
  servings: 1,
  ingredients: [salt, pepper, bacon, lettuce, tomato, bread],
  instructions: [toastBread, prepIngredients, assembleSandwich],
  substitutions: [subTurkeyBacon],
};

describe("scale", () => {
  const double = scale(blt, 2);
  const half = scale(blt, 0.5);

  it("doubles ingredient amounts", () => {
    expect(double.ingredients).toEqual([
      { ...salt, amount: null },
      { ...pepper, amount: 2 },
      { ...bacon, amount: 6 },
      { ...lettuce, amount: 2 },
      { ...tomato, amount: 2 },
      { ...bread, amount: 4 },
    ]);
  });

  it("halves ingredient amounts", () => {
    expect(half.ingredients).toEqual([
      { ...salt, amount: null },
      { ...pepper, amount: 0.5 },
      { ...bacon, amount: 1.5 },
      { ...lettuce, amount: 0.5 },
      { ...tomato, amount: 0.5 },
      { ...bread, amount: 1 },
    ]);
  });

  it("doubles substituted ingredient amounts", () => {
    expect(
      double.substitutions.find(
        (substitution) => substitution.newIngredient.name === "turkey_bacon",
      )?.newIngredient,
    ).toEqual({ ...turkeyBacon, amount: 6 });
  });

  it("doubles recipe serving size", () => {
    expect(double.servings).toBe(2);
  });

  it("halves recipe serving size", () => {
    expect(half.servings).toBe(0.5);
  });

  it("leaves the recipe ID unchanged", () => {
    expect(double.id).toBe(blt.id);
  });

  it("handles 'pinches' and other informal units appropriately", () => {
    expect(
      half.ingredients.find((ingredient) => ingredient.name === "salt")?.amount,
    ).toBe(null);
  });
});
