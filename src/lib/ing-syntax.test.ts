import {
  applyIngredientSelection,
  filterIngredientNames,
  findOpenIngContext,
  findUnresolvedReferences,
  levenshteinDistance,
  parseIngredientReferences,
  parseStepDisplaySegments,
} from "@/lib/ing-syntax";

describe("findOpenIngContext", () => {
  it("detects an open ing( right at the cursor", () => {
    const text = "Add ing(chick";
    const context = findOpenIngContext(text, text.length);
    expect(context).toEqual({ start: 8, query: "chick" });
  });

  it("returns null when there's no ing( at all", () => {
    const text = "Bake for 10 minutes";
    expect(findOpenIngContext(text, text.length)).toBeNull();
  });

  it("returns null once the ing( has already been closed", () => {
    const text = "Add ing(chicken) to the pan";
    expect(findOpenIngContext(text, text.length)).toBeNull();
  });

  it("isn't fooled by an unrelated ing( later in the text", () => {
    const text = "Add ing(chicken) then ing(salt";
    const cursorRightAfterFirstClose = "Add ing(chicken) then ".length;
    expect(findOpenIngContext(text, cursorRightAfterFirstClose)).toBeNull();
  });
});

describe("applyIngredientSelection", () => {
  it("splices the chosen name in and closes the parenthesis", () => {
    const text = "Add ing(chick";
    const context = findOpenIngContext(text, text.length)!;
    const result = applyIngredientSelection(
      text,
      context,
      text.length,
      "chicken breasts",
    );
    expect(result.text).toBe("Add ing(chicken breasts)");
    expect(result.cursorPosition).toBe(result.text.length);
  });

  it("preserves text typed after the cursor", () => {
    const text = "Add ing(chick to the pan";
    const cursor = "Add ing(chick".length;
    const context = findOpenIngContext(text, cursor)!;
    const result = applyIngredientSelection(text, context, cursor, "chicken");
    expect(result.text).toBe("Add ing(chicken) to the pan");
  });
});

describe("filterIngredientNames", () => {
  const names = ["chicken breasts", "chicken broth", "salt", ""];

  it("matches by substring, case-insensitively", () => {
    expect(filterIngredientNames(names, "CHICK")).toEqual([
      "chicken breasts",
      "chicken broth",
    ]);
  });

  it("returns every non-empty name when the query is blank", () => {
    expect(filterIngredientNames(names, "")).toEqual([
      "chicken breasts",
      "chicken broth",
      "salt",
    ]);
  });

  it("returns nothing when nothing matches", () => {
    expect(filterIngredientNames(names, "zzz")).toEqual([]);
  });
});

describe("parseIngredientReferences", () => {
  const names = ["chicken breasts", "salt"];

  it("resolves references that exactly match, case-insensitively", () => {
    const text = "Season the ing(Chicken Breasts) with ing(salt)";
    expect(parseIngredientReferences(text, names)).toEqual([
      "chicken breasts",
      "salt",
    ]);
  });

  it("skips references that don't match anything", () => {
    const text = "Add ing(pepper) to taste";
    expect(parseIngredientReferences(text, names)).toEqual([]);
  });
});

describe("findUnresolvedReferences", () => {
  const names = ["chicken breasts", "salt"];

  it("finds no issues when every reference resolves", () => {
    const text = "Cook the ing(chicken breasts)";
    expect(findUnresolvedReferences(text, names)).toEqual([]);
  });

  it("flags a reference that doesn't match, with a close-match suggestion", () => {
    const text = "Cook the ing(chiken breasts)";
    const result = findUnresolvedReferences(text, names);
    expect(result).toEqual([
      { raw: "chiken breasts", suggestion: "chicken breasts" },
    ]);
  });

  it("suggests nothing when no ingredient is close enough", () => {
    const text = "Add ing(xyz)";
    const result = findUnresolvedReferences(text, names);
    expect(result).toEqual([{ raw: "xyz", suggestion: null }]);
  });
});

describe("parseStepDisplaySegments", () => {
  it("strips the keyword and parens, keeping the inner value as its own segment", () => {
    const text = "Bake amt(2) unit(lbs) of ing(chicken) in the oven";
    expect(parseStepDisplaySegments(text)).toEqual([
      { type: "text", text: "Bake " },
      { type: "value", text: "2" },
      { type: "text", text: " " },
      { type: "value", text: "lbs" },
      { type: "text", text: " of " },
      { type: "value", text: "chicken" },
      { type: "text", text: " in the oven" },
    ]);
  });

  it("returns a single text segment when there's no keyword at all", () => {
    expect(parseStepDisplaySegments("Preheat the oven")).toEqual([
      { type: "text", text: "Preheat the oven" },
    ]);
  });

  it("handles a keyword at the very start or end of the string", () => {
    expect(parseStepDisplaySegments("ing(salt) to taste")).toEqual([
      { type: "value", text: "salt" },
      { type: "text", text: " to taste" },
    ]);
    expect(parseStepDisplaySegments("Add the ing(salt)")).toEqual([
      { type: "text", text: "Add the " },
      { type: "value", text: "salt" },
    ]);
  });
});

describe("levenshteinDistance", () => {
  it("is zero for identical strings", () => {
    expect(levenshteinDistance("chicken", "chicken")).toBe(0);
  });

  it("counts a single substitution as distance 1", () => {
    expect(levenshteinDistance("chiken", "chicken")).toBe(1);
  });

  it("counts insertions and deletions correctly", () => {
    expect(levenshteinDistance("cat", "cats")).toBe(1);
    expect(levenshteinDistance("cats", "cat")).toBe(1);
  });
});
