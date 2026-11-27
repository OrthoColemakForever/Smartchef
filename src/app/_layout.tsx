import { Stack } from "expo-router";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SidebarNav } from "@/components/sidebar-nav";
import { getAllRecipes, saveRecipe, setupDatabase } from "@/lib/database";
import { sampleRecipes } from "@/lib/seed-recipes";

SplashScreen.preventAutoHideAsync();

async function onInit(db: SQLiteDatabase) {
  await setupDatabase(db);

  const existing = await getAllRecipes(db);
  if (existing.length === 0) {
    for (const recipe of sampleRecipes) {
      await saveRecipe(db, recipe);
    }
  }
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="smartchef.db" onInit={onInit}>
      <AnimatedSplashOverlay />
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                animation: "fade",
                animationTypeForReplace: "push",
              }}
            />
            <Stack.Screen
              name="new-recipe"
              options={{
                title: "Add a New Recipe",
                headerTitleStyle: { fontSize: 26, fontWeight: "600" },
                animation: "fade",
                animationTypeForReplace: "push",
              }}
            />
            <Stack.Screen
              name="recipe/[id]"
              options={{
                title: "Recipe Details",
                headerTitleStyle: { fontSize: 26, fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="cook"
              options={{
                title: "Let's Cook",
                headerShown: false,
                animation: "fade",
                animationTypeForReplace: "push",
              }}
            />
          </Stack>
        </View>
        <SidebarNav />
      </View>
    </SQLiteProvider>
  );
}
