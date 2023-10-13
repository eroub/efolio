// Arrows.tsx
import { colorScheme } from "./themes";
import { useCurrentTheme } from "../hooks/useAppColorScheme";

export const GreenUpArrow = () => {
  const themeColor = useCurrentTheme();
  return (
    <svg width="26" height="18" viewBox="6 10 12 3">
      <path fill={colorScheme[themeColor]["green"]} d="M7 14l5-5 5 5z"></path>
    </svg>
  );
};

export const RedDownArrow = () => {
  const themeColor = useCurrentTheme();
  return (
    <svg width="26" height="18" viewBox="6 10 12 3">
      <path fill={colorScheme[themeColor]["red"]} d="M7 10l5 5 5-5z"></path>
    </svg>
  );
};

export const DirectionArrows = () => {
  const themeColor = useCurrentTheme();
  return (
    <svg width="48" height="24" viewBox="6 10 20 3">
      {/* Green Up Arrow */}
      <path fill={colorScheme[themeColor]["green"]} d="M7 14l5-5 5 5z"></path>
      {/* Red Down Arrow */}
      <path
        fill={colorScheme[themeColor]["red"]}
        d="M7 10l5 5 5-5z"
        transform="translate(8, -1)"
      ></path>
    </svg>
  );
};

type ExpandShrinkProps = {
  style?: React.CSSProperties;
};

export const Expand: React.FC<ExpandShrinkProps> = ({ style }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      d="M16 8L21 3M21 3H16M21 3V8M8 8L3 3M3 3L3 8M3 3L8 3M8 16L3 21M3 21H8M3 21L3 16M16 16L21 21M21 21V16M21 21H16"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Shrink: React.FC<ExpandShrinkProps> = ({ style }) => (
  <svg
    fill="#000000"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    id="minimize-size"
    style={style}
  >
    <path d="M9,3A1,1,0,0,0,8,4V6.59L3.71,2.29A1,1,0,0,0,2.29,3.71L6.59,8H4a1,1,0,0,0,0,2H8a2,2,0,0,0,2-2V4A1,1,0,0,0,9,3Z"></path>
    <path d="M16,10h4a1,1,0,0,0,0-2H17.41l4.3-4.29a1,1,0,1,0-1.42-1.42L16,6.59V4a1,1,0,0,0-2,0V8A2,2,0,0,0,16,10Z"></path>
    <path d="M8,14H4a1,1,0,0,0,0,2H6.59l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L8,17.41V20a1,1,0,0,0,2,0V16A2,2,0,0,0,8,14Z"></path>
    <path d="M17.41,16H20a1,1,0,0,0,0-2H16a2,2,0,0,0-2,2v4a1,1,0,0,0,2,0V17.41l4.29,4.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"></path>
  </svg>
);
