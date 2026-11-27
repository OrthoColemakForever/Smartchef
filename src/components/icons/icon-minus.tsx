import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export function IconMinus({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="minusGrad" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#FFB199" />
          <Stop offset="100%" stopColor="#C9402A" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="54" r="40" fill="#000000" opacity={0.15} />
      <Circle cx="50" cy="50" r="40" fill="url(#minusGrad)" />
      <Rect x="28" y="44" width="44" height="12" rx="6" fill="#ffffff" />
    </Svg>
  );
}
