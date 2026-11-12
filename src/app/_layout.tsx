import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { setupDatabase } from "@/lib/database";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <SQLiteProvider databaseName="smartchef.db" onInit={setupDatabase}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </SQLiteProvider>
  );
}
