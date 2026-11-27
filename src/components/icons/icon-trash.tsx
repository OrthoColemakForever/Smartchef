import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export function IconTrash({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="trashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#9BA4B5" />
          <Stop offset="50%" stopColor="#7A8494" />
          <Stop offset="100%" stopColor="#4B5363" />
        </LinearGradient>
        <LinearGradient id="lidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#9BA4B5" />
          <Stop offset="100%" stopColor="#6B7484" />
        </LinearGradient>
      </Defs>

      <Rect
        x="26"
        y="37"
        width="48"
        height="53"
        rx="8"
        fill="url(#trashGrad)"
      />

      <Rect x="40" y="12" width="20" height="10" rx="3" fill="#6B7484" />
      <Rect x="20" y="22" width="62" height="12" rx="5" fill="url(#lidGrad)" />

      <Rect x="33" y="52" width="4" height="32" rx="2" fill="#7D8490" />
      <Rect x="41" y="52" width="4" height="32" rx="2" fill="#7D8490" />
      <Rect x="49" y="52" width="4" height="32" rx="2" fill="#7D8490" />
      <Rect x="57" y="52" width="4" height="32" rx="2" fill="#7D8490" />
      <Rect x="65" y="52" width="4" height="32" rx="2" fill="#7D8490" />
    </Svg>
  );
}
