import { randomUUID } from "expo-crypto";
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Recipe, RecipeCategory, Step, Unit } from "@/lib/recipe-graph";
import { Colors, Spacing } from "@/constants/theme";

const GREEN = "#4CAF50";
const RED = "#c44536";
const GOLD = "#e8a93a";
const MAX_HIGHLIGHTED = 3;

const CATEGORY_COLUMNS: RecipeCategory[][] = [
  ["breakfast", "lunch", "dinner"],
  ["snack", "side", "dessert"],
];

const CATEGORY_COLORS: Record<RecipeCategory, string> = {
  breakfast: "#f2994a",
  lunch: "#4CAF50",
  dinner: "#5c6bc0",
  snack: "#f2c94c",
  side: "#26a69a",
  dessert: "#ec407a",
};

type IngredientDraft = {
  id: string;
  name: string;
  amount: string;
  unit: string;
  isHighlighted: boolean;
};

type StepDraft = {
  id: string;
  command: string;
};

const VALID_UNITS: Exclude<Unit, null>[] = [
  "tsp",
  "tbsp",
  "fl oz",
  "cup",
  "pint",
  "quart",
  "gallon",
  "oz",
  "can",
  "slice",
  "clove",
  "half",
];

function parseUnit(text: string): Unit {
  const normalized = text.trim().toLowerCase();
  const match = VALID_UNITS.find((unit) => unit === normalized);
  return match ?? null;
}

function ingredientDraftsFrom(recipe: Recipe | undefined): IngredientDraft[] {
  if (!recipe) return [];
  return recipe.ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    amount: ingredient.amount === null ? "" : String(ingredient.amount),
    unit: ingredient.unit ?? "",
    isHighlighted: recipe.highlightIngredientIDs.includes(ingredient.id),
  }));
}

function stepDraftsFrom(recipe: Recipe | undefined): StepDraft[] {
  if (!recipe) return [];
  return recipe.steps
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((step) => ({ id: step.id, command: step.command }));
}

type RecipeFormProps = {
  initialRecipe?: Recipe;
  editable: boolean;
  submitLabel: string;
  onSubmit: (recipe: Recipe) => Promise<void>;
};

export type RecipeFormHandle = {
  submit: () => Promise<void>;
  hasChanges: () => boolean;
};

export const RecipeForm = forwardRef<RecipeFormHandle, RecipeFormProps>(
  function RecipeForm({ initialRecipe, editable, submitLabel, onSubmit }, ref) {
  const [name, setName] = useState(initialRecipe?.name ?? "");
  const [servings, setServings] = useState(
    initialRecipe ? String(initialRecipe.servings) : "",
  );
  const [imageUri, setImageUri] = useState<string | undefined>(
    initialRecipe?.imageUri,
  );
  const [categories, setCategories] = useState<RecipeCategory[]>(
    initialRecipe?.categories ?? [],
  );
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    ingredientDraftsFrom(initialRecipe),
  );
  const [steps, setSteps] = useState<StepDraft[]>(stepDraftsFrom(initialRecipe));

  // A one-time snapshot of the original values, taken on first render only
  // (useRef's initial value is computed once and never recalculated) — used
  // to detect unsaved changes by comparing current state against it.
  const initialSnapshot = useRef(
    JSON.stringify({
      name: initialRecipe?.name ?? "",
      servings: initialRecipe ? String(initialRecipe.servings) : "",
      imageUri: initialRecipe?.imageUri,
      categories: initialRecipe?.categories ?? [],
      ingredients: ingredientDraftsFrom(initialRecipe),
      steps: stepDraftsFrom(initialRecipe),
    }),
  ).current;

  function hasChanges() {
    const current = JSON.stringify({
      name,
      servings,
      imageUri,
      categories,
      ingredients,
      steps,
    });
    return current !== initialSnapshot;
  }

  const highlightedCount = ingredients.filter((i) => i.isHighlighted).length;

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  function addIngredient() {
    setIngredients([
      ...ingredients,
      {
        id: randomUUID(),
        name: "",
        amount: "",
        unit: "",
        isHighlighted: false,
      },
    ]);
  }

  function updateIngredient(
    id: string,
    field: "name" | "amount" | "unit",
    value: string,
  ) {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  }

  function toggleHighlight(id: string) {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, isHighlighted: !ingredient.isHighlighted }
          : ingredient,
      ),
    );
  }

  function toggleCategory(category: RecipeCategory) {
    setCategories(
      categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category],
    );
  }

  function removeIngredient(id: string) {
    setIngredients(ingredients.filter((ingredient) => ingredient.id !== id));
  }

  function addStep() {
    setSteps([...steps, { id: randomUUID(), command: "" }]);
  }

  function updateStep(id: string, command: string) {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, command } : step)),
    );
  }

  function removeStep(id: string) {
    setSteps(steps.filter((step) => step.id !== id));
  }

  async function handleSubmit() {
    if (name.trim() === "") return;

    const recipe: Recipe = {
      id: initialRecipe?.id ?? randomUUID(),
      name: name.trim(),
      imageUri,
      categories,
      servings: Number(servings) || 1,
      ingredients: ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name.trim(),
        amount:
          ingredient.amount.trim() === "" ? null : Number(ingredient.amount),
        unit: parseUnit(ingredient.unit),
      })),
      highlightIngredientIDs: ingredients
        .filter((ingredient) => ingredient.isHighlighted)
        .map((ingredient) => ingredient.id),
      steps: steps.map(
        (step, index): Step => ({
          id: step.id,
          index,
          command: step.command.trim(),
          usesIngredientIDs: [],
        }),
      ),
      substitutions: initialRecipe?.substitutions ?? [],
    };

    await onSubmit(recipe);
  }

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    hasChanges,
  }));

  return (
    <View
      style={styles.root}
      onLayout={(event) =>
        setLayout({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        })
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topRow}>
          <View style={[styles.topRowLeft, { minHeight: layout.height / 2 }]}>
            <TextInput
              value={name}
              onChangeText={setName}
              editable={editable}
              placeholder="Recipe name"
              style={styles.titleInput}
            />
            <TextInput
              value={servings}
              onChangeText={setServings}
              editable={editable}
              placeholder="Number of servings"
              keyboardType="numeric"
              style={styles.titleInput}
            />

            <View style={styles.categoriesSpacer} />

            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryColumns}>
              {CATEGORY_COLUMNS.map((column, columnIndex) => (
                <View key={columnIndex} style={styles.categoryColumn}>
                  {column.map((category) => {
                    const selected = categories.includes(category);
                    return (
                      <Pressable
                        key={category}
                        disabled={!editable}
                        onPress={() => toggleCategory(category)}
                        style={[
                          styles.categoryChip,
                          selected && {
                            backgroundColor: CATEGORY_COLORS[category],
                            borderColor: CATEGORY_COLORS[category],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selected && styles.categoryChipTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={pickImage}
            disabled={!editable}
            style={[
              styles.imagePreview,
              { width: layout.width / 2, height: layout.height / 2 },
            ]}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreviewImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.imagePreviewPlaceholder}>
                <FontAwesome6
                  name="camera"
                  iconStyle="solid"
                  size={36}
                  color={Colors.textSecondary}
                />
                <Text style={styles.imagePreviewText}>Add Photo</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.counterText}>
            {highlightedCount}/3 Highlight Ingredients Selected
          </Text>
        </View>

        {ingredients.map((ingredient) => {
          const showEmptyStar = !ingredient.isHighlighted;
          const starIsHidden = editable
            ? showEmptyStar && highlightedCount >= MAX_HIGHLIGHTED
            : showEmptyStar;

          return (
            <View
              key={ingredient.id}
              style={[
                styles.row,
                ingredient.isHighlighted && styles.rowHighlighted,
              ]}
            >
              {editable ? (
                <Pressable
                  onPress={() => removeIngredient(ingredient.id)}
                  style={styles.iconButton}
                >
                  <FontAwesome6
                    name="circle-minus"
                    iconStyle="solid"
                    size={46}
                    color={RED}
                  />
                </Pressable>
              ) : (
                <View style={styles.iconButton} />
              )}
              <TextInput
                value={ingredient.name}
                onChangeText={(text) =>
                  updateIngredient(ingredient.id, "name", text)
                }
                editable={editable}
                placeholder="Ingredient"
                style={styles.rowInputName}
              />
              <TextInput
                value={ingredient.amount}
                onChangeText={(text) =>
                  updateIngredient(ingredient.id, "amount", text)
                }
                editable={editable}
                placeholder="Amount"
                keyboardType="numeric"
                style={styles.rowInputAmount}
              />
              <TextInput
                value={ingredient.unit}
                onChangeText={(text) =>
                  updateIngredient(ingredient.id, "unit", text)
                }
                editable={editable}
                placeholder="Unit"
                style={styles.rowInputUnit}
              />
              {starIsHidden ? (
                <View style={styles.starPlaceholder} />
              ) : editable ? (
                <Pressable
                  onPress={() => toggleHighlight(ingredient.id)}
                  style={styles.starButton}
                >
                  <FontAwesome6
                    name="star"
                    iconStyle={ingredient.isHighlighted ? "solid" : "regular"}
                    size={36}
                    color={GOLD}
                  />
                </Pressable>
              ) : (
                <View style={styles.starButton}>
                  <FontAwesome6
                    name="star"
                    iconStyle="solid"
                    size={36}
                    color={GOLD}
                  />
                </View>
              )}
            </View>
          );
        })}

        {editable && (
          <View style={styles.row}>
            <Pressable onPress={addIngredient} style={styles.iconButton}>
              <FontAwesome6
                name="circle-plus"
                iconStyle="solid"
                size={52}
                color={GREEN}
              />
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Steps</Text>
        </View>

        {steps.map((step, index) => (
          <View key={step.id} style={styles.row}>
            {editable ? (
              <Pressable
                onPress={() => removeStep(step.id)}
                style={styles.iconButton}
              >
                <FontAwesome6
                  name="circle-minus"
                  iconStyle="solid"
                  size={46}
                  color={RED}
                />
              </Pressable>
            ) : (
              <View style={styles.iconButton} />
            )}
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <TextInput
              value={step.command}
              onChangeText={(text) => updateStep(step.id, text)}
              editable={editable}
              placeholder="Describe this step"
              style={styles.rowInputName}
              multiline
            />
          </View>
        ))}

        {editable && (
          <View style={styles.row}>
            <Pressable onPress={addStep} style={styles.iconButton}>
              <FontAwesome6
                name="circle-plus"
                iconStyle="solid"
                size={52}
                color={GREEN}
              />
            </Pressable>
          </View>
        )}

        {editable && (
          <Pressable onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{submitLabel}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
  },
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  topRowLeft: {
    flex: 1,
    gap: Spacing.three,
  },
  categoriesSpacer: {
    flex: 1,
  },
  imagePreview: {
    borderRadius: Spacing.three,
    backgroundColor: Colors.backgroundElement,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewImage: {
    width: "100%",
    height: "100%",
  },
  imagePreviewPlaceholder: {
    alignItems: "center",
    gap: Spacing.one,
  },
  imagePreviewText: {
    fontSize: 33,
    color: Colors.textSecondary,
  },
  titleInput: {
    fontSize: 42,
    fontWeight: "600",
    color: Colors.text,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.backgroundSelected,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  categoryColumns: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  categoryColumn: {
    flex: 1,
    gap: Spacing.three,
  },
  categoryChip: {
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.backgroundSelected,
    borderRadius: 999,
    paddingHorizontal: Spacing.five,
    paddingVertical: 20,
    alignItems: "center",
  },
  categoryChipText: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  categoryChipTextSelected: {
    color: "#ffffff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.five,
  },
  sectionTitle: {
    fontSize: 33,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: Spacing.four,
  },
  counterText: {
    fontSize: 33,
    fontWeight: "600",
    color: GOLD,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.one,
    marginBottom: Spacing.one,
    borderRadius: Spacing.two,
  },
  rowHighlighted: {
    backgroundColor: Colors.backgroundSelected,
  },
  rowInputName: {
    flex: 2,
    fontSize: 33,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  rowInputAmount: {
    flex: 1,
    fontSize: 33,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  rowInputUnit: {
    flex: 1,
    fontSize: 33,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  iconButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  starButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  starPlaceholder: {
    width: 42,
    height: 42,
  },
  stepNumber: {
    fontSize: 33,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  saveButton: {
    marginTop: Spacing.four,
    backgroundColor: GREEN,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "600",
  },
});
