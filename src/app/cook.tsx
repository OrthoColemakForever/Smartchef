import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Colors, Spacing } from "@/constants/theme";

const BAR_COUNT = 5;
const MIN_HEIGHT = 12;
const MAX_HEIGHT = 72;
const DURATION = 500;

function WaveformBar({ delay }: { delay: number }) {
  const height = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    height.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(MAX_HEIGHT, { duration: DURATION }),
          withTiming(MIN_HEIGHT, { duration: DURATION }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

export default function CookScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <WaveformBar key={index} delay={index * 120} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    height: MAX_HEIGHT,
  },
  bar: {
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
});
