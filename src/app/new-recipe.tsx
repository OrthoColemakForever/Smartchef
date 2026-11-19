import { randomUUID } from "expo-crypto";
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
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
import { Recipe, Step, Unit } from "@/lib/recipe-graph";
import { Colors, Spacing } from "@/constants/theme";

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
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);
  const [steps, setSteps] = useState<StepDraft[]>([]);

  function addIngredient() {
    setIngredients([
      ...ingredients,
      { id: randomUUID(), name: "", amount: "", unit: "", isHighlighted: false },
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
      categories: [],
      servings: Number(servings) || 1,
      ingredients: ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name.trim(),
        amount: ingredient.amount.trim() === "" ? null : Number(ingredient.amount),
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        style={styles.input}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <Pressable onPress={addIngredient}>
          <FontAwesome6
            name="circle-plus"
            iconStyle="solid"
            size={26}
            color={Colors.accent}
          />
        </Pressable>
      </View>

      {ingredients.map((ingredient) => (
        <View
          key={ingredient.id}
          style={[
            styles.row,
            ingredient.isHighlighted && styles.rowHighlighted,
          ]}
        >
          <Pressable onPress={() => toggleHighlight(ingredient.id)}>
            <FontAwesome6
              name="star"
              iconStyle={ingredient.isHighlighted ? "solid" : "regular"}
              size={20}
              color="#e8a93a"
            />
          </Pressable>
          <TextInput
            value={ingredient.name}
            onChangeText={(text) => updateIngredient(ingredient.id, "name", text)}
            placeholder="Ingredient"
            style={styles.rowInputName}
          />
          <TextInput
            value={ingredient.amount}
            onChangeText={(text) =>
              updateIngredient(ingredient.id, "amount", text)
            }
            placeholder="Amt"
            keyboardType="numeric"
            style={styles.rowInputAmount}
          />
          <TextInput
            value={ingredient.unit}
            onChangeText={(text) => updateIngredient(ingredient.id, "unit", text)}
            placeholder="Unit"
            style={styles.rowInputUnit}
          />
          <Pressable onPress={() => removeIngredient(ingredient.id)}>
            <FontAwesome6
              name="circle-minus"
              iconStyle="solid"
              size={22}
              color="#c44536"
            />
          </Pressable>
        </View>
      ))}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Steps</Text>
        <Pressable onPress={addStep}>
          <FontAwesome6
            name="circle-plus"
            iconStyle="solid"
            size={26}
            color={Colors.accent}
          />
        </Pressable>
      </View>

      {steps.map((step, index) => (
        <View key={step.id} style={styles.row}>
          <Text style={styles.stepNumber}>{index + 1}.</Text>
          <TextInput
            value={step.command}
            onChangeText={(text) => updateStep(step.id, text)}
            placeholder="Describe this step"
            style={styles.rowInputName}
            multiline
          />
          <Pressable onPress={() => removeStep(step.id)}>
            <FontAwesome6
              name="circle-minus"
              iconStyle="solid"
              size={22}
              color="#c44536"
            />
          </Pressable>
        </View>
      ))}

      <Pressable onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Recipe</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    paddingVertical: Spacing.one,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: Spacing.one,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.one,
    borderRadius: Spacing.two,
  },
  rowHighlighted: {
    backgroundColor: Colors.backgroundSelected,
  },
  rowInputName: {
    flex: 2,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  rowInputAmount: {
    flex: 1,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  rowInputUnit: {
    flex: 1,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundElement,
    paddingVertical: Spacing.one,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  saveButton: {
    marginTop: Spacing.four,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
