// Arrows.tsx
export const GreenUpArrow = () => (
  <svg width="26" height="18" viewBox="6 10 12 3">
    <path fill="green" d="M7 14l5-5 5 5z"></path>
  </svg>
);

export const RedDownArrow = () => (
  <svg width="26" height="18" viewBox="6 10 12 3">
    <path fill="red" d="M7 10l5 5 5-5z"></path>
  </svg>
);

export const DirectionArrows = () => (
  <svg width="48" height="24" viewBox="6 10 20 3">
    {/* Green Up Arrow */}
    <path fill="green" d="M7 14l5-5 5 5z"></path>
    {/* Red Down Arrow */}
    <path fill="red" d="M7 10l5 5 5-5z" transform="translate(8, -1)"></path>
  </svg>
);