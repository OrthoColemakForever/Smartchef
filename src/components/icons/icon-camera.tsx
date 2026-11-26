import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

export function IconCamera({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="camBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#CDD3DB" />
          <Stop offset="100%" stopColor="#8B93A1" />
        </LinearGradient>
        <RadialGradient id="camLensGrad" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#5A6B9E" />
          <Stop offset="100%" stopColor="#14182A" />
        </RadialGradient>
      </Defs>

      <Rect x="24" y="24" width="20" height="12" rx="3" fill="#2E333B" />
      <Rect x="10" y="32" width="80" height="48" rx="10" fill="url(#camBodyGrad)" />

      <Circle cx="38" cy="56" r="22" fill="#2E333B" />
      <Circle cx="38" cy="56" r="18" fill="#9AA5B1" />
      <Circle cx="38" cy="56" r="14" fill="url(#camLensGrad)" />

      <Circle cx="76" cy="42" r="5" fill="#C9402A" />
    </Svg>
  );
}
