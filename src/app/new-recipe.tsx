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
import { useState } from "react";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { saveRecipe } from "@/lib/database";
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

export default function NewRecipeForm() {
  const db = useSQLiteContext();
  const [name, setName] = useState("");
  const [servings, setServings] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);
  const [steps, setSteps] = useState<StepDraft[]>([]);

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

  async function handleSave() {
    if (name.trim() === "") return;

    const recipe: Recipe = {
      id: randomUUID(),
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
      substitutions: [],
    };

    await saveRecipe(db, recipe);
    router.back();
  }

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
          <View
            style={[styles.topRowLeft, { height: layout.height / 2 }]}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Recipe name"
              style={styles.titleInput}
            />
            <TextInput
              value={servings}
              onChangeText={setServings}
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
          const starIsHidden =
            showEmptyStar && highlightedCount >= MAX_HIGHLIGHTED;

          return (
            <View
              key={ingredient.id}
              style={[
                styles.row,
                ingredient.isHighlighted && styles.rowHighlighted,
              ]}
            >
              <Pressable onPress={() => removeIngredient(ingredient.id)} style={styles.iconButton}>
                <FontAwesome6
                  name="circle-minus"
                  iconStyle="solid"
                  size={39}
                  color={RED}
                />
              </Pressable>
              <TextInput
                value={ingredient.name}
                onChangeText={(text) =>
                  updateIngredient(ingredient.id, "name", text)
                }
                placeholder="Ingredient"
                style={styles.rowInputName}
              />
              <TextInput
                value={ingredient.amount}
                onChangeText={(text) =>
                  updateIngredient(ingredient.id, "amount", text)
                }
                placeholder="Amount"
                keyboardType="numeric"
                style={styles.rowInputAmount}
              />
              <TextInput
                value={ingredient.unit}
                onChangeText={(text) =>
                  updateIngredient(ingredient.id, "unit", text)
                }
                placeholder="Unit"
                style={styles.rowInputUnit}
              />
              {starIsHidden ? (
                <View style={styles.starPlaceholder} />
              ) : (
                <Pressable onPress={() => toggleHighlight(ingredient.id)} style={styles.starButton}>
                  <FontAwesome6
                    name="star"
                    iconStyle={ingredient.isHighlighted ? "solid" : "regular"}
                    size={36}
                    color={GOLD}
                  />
                </Pressable>
              )}
            </View>
          );
        })}

        <View style={styles.row}>
          <Pressable onPress={addIngredient} style={styles.iconButton}>
            <FontAwesome6
              name="circle-plus"
              iconStyle="solid"
              size={45}
              color={GREEN}
            />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Steps</Text>
        </View>

        {steps.map((step, index) => (
          <View key={step.id} style={styles.row}>
            <Pressable onPress={() => removeStep(step.id)} style={styles.iconButton}>
              <FontAwesome6
                name="circle-minus"
                iconStyle="solid"
                size={39}
                color={RED}
              />
            </Pressable>
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <TextInput
              value={step.command}
              onChangeText={(text) => updateStep(step.id, text)}
              placeholder="Describe this step"
              style={styles.rowInputName}
              multiline
            />
          </View>
        ))}

        <View style={styles.row}>
          <Pressable onPress={addStep} style={styles.iconButton}>
            <FontAwesome6
              name="circle-plus"
              iconStyle="solid"
              size={45}
              color={GREEN}
            />
          </Pressable>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  categoryChipText: {
    fontSize: 24,
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
    width: 52,
    height: 52,
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
