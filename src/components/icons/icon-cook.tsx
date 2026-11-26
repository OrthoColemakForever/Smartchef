import Svg, {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

export function IconCook({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="panGrad" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#E8EBF0" />
          <Stop offset="100%" stopColor="#9AA3B0" />
        </RadialGradient>
      </Defs>

      <Rect
        x="0"
        y="58"
        width="56"
        height="9"
        rx="4.5"
        fill="#1A1A1A"
        transform="rotate(-10 28 62)"
      />

      <Ellipse
        cx="66"
        cy="52"
        rx="26"
        ry="22"
        fill="url(#panGrad)"
        stroke="#5A6472"
        strokeWidth={3.5}
      />
      <Ellipse cx="66" cy="47" rx="18" ry="14" fill="#C3CAD3" />

      <Ellipse cx="66" cy="50" rx="13" ry="9" fill="#FFFFFF" />
      <Circle cx="66" cy="49" r="6" fill="#F2B705" />
      <Circle cx="63" cy="46.5" r="1.8" fill="#FFE27A" opacity={0.8} />
    </Svg>
  );
}
