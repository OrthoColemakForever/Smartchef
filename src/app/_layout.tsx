import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { getAllRecipes, saveRecipe, setupDatabase } from "@/lib/database";
import { sampleRecipes } from "@/app/(tabs)/index";

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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="new-recipe"
          options={{
            title: "Add a New Recipe",
            headerTitleStyle: { fontSize: 26, fontWeight: "600" },
          }}
        />
      </Stack>
    </SQLiteProvider>
  );
}
