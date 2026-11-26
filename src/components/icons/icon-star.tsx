import Svg, { Defs, Polygon, RadialGradient, Stop } from "react-native-svg";

const STAR_POINTS =
  "50,10 59.4,37.1 88,37.6 65.2,54.9 73.5,82.4 50,66 26.5,82.4 34.8,54.9 12,37.6 40.6,37.1";

export function IconStar({
  size = 48,
  filled = true,
}: {
  size?: number;
  filled?: boolean;
}) {
  if (!filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Polygon
          points={STAR_POINTS}
          fill="none"
          stroke="#B7BDC7"
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="starGrad" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#FFE992" />
          <Stop offset="100%" stopColor="#E6A62B" />
        </RadialGradient>
      </Defs>
      <Polygon points={STAR_POINTS} fill="url(#starGrad)" />
    </Svg>
  );
}
