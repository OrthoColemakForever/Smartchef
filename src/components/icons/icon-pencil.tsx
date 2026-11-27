import Svg, {
  Defs,
  G,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

export function IconPencil({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="pencilBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFD873" />
          <Stop offset="100%" stopColor="#F2A93C" />
        </LinearGradient>
      </Defs>
      <G transform="rotate(225 50 50)">
        <Polygon points="50,0 46,8 54,8" fill="#9B9B9B" />
        <Polygon points="46,8 54,8 60,20 40,20" fill="#E8C285" />
        <Rect x="40" y="20" width="20" height="50" fill="url(#pencilBodyGrad)" />
        <Rect x="40" y="70" width="20" height="10" fill="#4CAF50" />
        <Rect x="40" y="80" width="20" height="16" rx="5" fill="#E6629C" />
      </G>
    </Svg>
  );
}
