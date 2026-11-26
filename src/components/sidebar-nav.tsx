import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { router, usePathname } from "expo-router";
import { Colors, Spacing } from "@/constants/theme";
import { IconHome } from "@/components/icons/icon-home";
import { IconPlus } from "@/components/icons/icon-plus";
import { IconCook } from "@/components/icons/icon-cook";

const DESTINATIONS = [
  { href: "/", Icon: IconHome, label: "Home" },
  { href: "/new-recipe", Icon: IconPlus, label: "Add Recipe" },
  { href: "/cook", Icon: IconCook, label: "Let's Cook" },
] as const;

export function SidebarNav() {
  const pathname = usePathname();
  const [sidebarHeight, setSidebarHeight] = useState(0);

  function navigateTo(href: (typeof DESTINATIONS)[number]["href"]) {
    if (href === pathname) return;
    router.replace(href);
  }

  return (
    <View
      style={styles.sidebar}
      onLayout={(event) => setSidebarHeight(event.nativeEvent.layout.height)}
    >
      <View style={{ transform: [{ translateY: -sidebarHeight * 0.1 }] }}>
        <View style={styles.items}>
          {DESTINATIONS.map((destination) => {
            const isActive = pathname === destination.href;
            const Icon = destination.Icon;
            return (
              <Pressable
                key={destination.href}
                onPress={() => navigateTo(destination.href)}
                style={styles.item}
              >
                <Icon size={54} />
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {destination.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 140,
    backgroundColor: Colors.backgroundElement,
    borderLeftWidth: 1,
    borderLeftColor: Colors.backgroundSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  items: {
    alignItems: "center",
    gap: Spacing.five,
  },
  item: {
    alignItems: "center",
    gap: Spacing.one,
    width: "100%",
    paddingVertical: Spacing.two,
  },
  label: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  labelActive: {
    color: Colors.accent,
  },
});
