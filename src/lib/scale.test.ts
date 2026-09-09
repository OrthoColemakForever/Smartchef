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
  usesIngredientIDs: [bread.id, lettuce.id, bacon.id, tomato.id],
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
  ingredients: [bacon, lettuce, tomato, bread],
  instructions: [toastBread, prepIngredients, assembleSandwich],
  substitutions: [subTurkeyBacon],
};

describe("scale", () => {
  const double = scale(blt, 2);
  const half = scale(blt, 0.5);
  const normal = scale(blt, 1);

  it("doubles ingredient amounts", () => {
    expect(double.ingredients).toEqual([
      { ...bacon, amount: 6 },
      { ...lettuce, amount: 2 },
      { ...tomato, amount: 2 },
      { ...bread, amount: 4 },
    ]);
  });

  it("doubles recipe serving size", () => {
    expect(double.servings).toBe(2);
  });
});
