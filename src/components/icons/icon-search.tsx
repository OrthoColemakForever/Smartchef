import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

export function IconSearch({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="lensGrad" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#D6ECFB" />
          <Stop offset="100%" stopColor="#8FC6EC" />
        </RadialGradient>
      </Defs>
      <Rect
        x="45.5"
        y="50"
        width="9"
        height="48"
        rx="4.5"
        fill="#8B5A2B"
        transform="rotate(-45 50 50)"
      />
      <Circle cx="50" cy="50" r="5.5" fill="#E0A526" />
      <Circle cx="35" cy="35" r="21" fill="url(#lensGrad)" />
      <Circle cx="35" cy="35" r="21" fill="none" stroke="#E0A526" strokeWidth={7} />
    </Svg>
  );
}
