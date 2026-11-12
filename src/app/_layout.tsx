import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { setupDatabase } from "@/lib/database";

SplashScreen.preventAutoHideAsync();

async function onInit(db: SQLiteDatabase) {
  await setupDatabase(db);
}

export default function TabLayout() {
  return (
    <SQLiteProvider databaseName="smartchef.db" onInit={onInit}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </SQLiteProvider>
  );
}
