import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export function IconPlus({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="plusGrad" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#8FE8A8" />
          <Stop offset="100%" stopColor="#1E8F5E" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="54" r="40" fill="#000000" opacity={0.15} />
      <Circle cx="50" cy="50" r="40" fill="url(#plusGrad)" />
      <Rect x="44" y="28" width="12" height="44" rx="6" fill="#ffffff" />
      <Rect x="28" y="44" width="44" height="12" rx="6" fill="#ffffff" />
    </Svg>
  );
}
