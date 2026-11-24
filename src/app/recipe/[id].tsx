import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { RecipeForm, RecipeFormHandle } from "@/components/recipe-form";
import { deleteRecipe, getRecipeById, updateRecipe } from "@/lib/database";
import { Recipe } from "@/lib/recipe-graph";
import { Colors, Spacing } from "@/constants/theme";

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<RecipeFormHandle>(null);

  useEffect(() => {
    async function loadRecipe() {
      const loaded = await getRecipeById(db, id);
      setRecipe(loaded);
    }
    loadRecipe();
  }, [db, id]);

  async function handleSubmit(updated: Recipe) {
    await updateRecipe(db, updated);
    setRecipe(updated);
    setIsEditing(false);
  }

  function handlePencilPress() {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!formRef.current?.hasChanges()) {
      setIsEditing(false);
      return;
    }

    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. Use the Save Changes button if you want to keep them, or discard them now.",
      [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setFormKey((key) => key + 1);
            setIsEditing(false);
          },
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteRecipe(db, id);
            router.back();
          },
        },
      ],
    );
  }

  if (recipe === undefined) {
    return <View style={styles.container} />;
  }

  if (recipe === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFoundText}>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable onPress={handlePencilPress} style={styles.toolbarButton}>
          <FontAwesome6
            name="pencil"
            iconStyle="solid"
            size={36}
            color={isEditing ? Colors.accent : Colors.textSecondary}
          />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.toolbarButton}>
          <FontAwesome6 name="trash" iconStyle="solid" size={36} color="#c44536" />
        </Pressable>
      </View>

      <RecipeForm
        key={formKey}
        ref={formRef}
        initialRecipe={recipe}
        editable={isEditing}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  toolbarButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
