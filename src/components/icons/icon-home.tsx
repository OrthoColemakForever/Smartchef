import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

export function IconHome({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F26B5A" />
          <Stop offset="100%" stopColor="#B82E22" />
        </LinearGradient>
        <LinearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFF4DD" />
          <Stop offset="100%" stopColor="#F0DBA8" />
        </LinearGradient>
        <LinearGradient id="chimneyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#9AA5B1" />
          <Stop offset="100%" stopColor="#6B7482" />
        </LinearGradient>
      </Defs>

      <Rect x="66" y="6" width="10" height="20" fill="url(#chimneyGrad)" />
      <Polygon points="6,46 50,8 94,46" fill="url(#roofGrad)" />
      <Rect x="16" y="42" width="68" height="50" rx="6" fill="url(#bodyGrad)" />

      <Rect x="24" y="52" width="16" height="16" rx="2" fill="#AED9F2" />
      <Rect x="24" y="52" width="16" height="16" rx="2" fill="none" stroke="#7FB8DE" strokeWidth={2} />
      <Rect x="60" y="52" width="16" height="16" rx="2" fill="#AED9F2" />
      <Rect x="60" y="52" width="16" height="16" rx="2" fill="none" stroke="#7FB8DE" strokeWidth={2} />

      <Rect x="44" y="70" width="12" height="22" rx="2" fill="#8B4A2E" />

      <Ellipse cx="14" cy="92" rx="12" ry="9" fill="#4CAF50" />
      <Ellipse cx="86" cy="92" rx="12" ry="9" fill="#3D9140" />
    </Svg>
  );
}
