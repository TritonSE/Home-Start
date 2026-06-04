export type ColorOption = {
  name: string;
  backgroundColor: string;
  textColor: string;
};

export const COLOR_OPTIONS: ColorOption[] = [
  { name: "Red", backgroundColor: "#F6E6E9", textColor: "#A40026" },
  { name: "Orange", backgroundColor: "#F9EFE6", textColor: "#C46200" },
  { name: "Yellow", backgroundColor: "#F9F5EF", textColor: "#886F42" },
  { name: "Green", backgroundColor: "#E6F2EC", textColor: "#007F3F" },
  { name: "Blue", backgroundColor: "#E6F2F3", textColor: "#007A8A" },
  { name: "Indigo", backgroundColor: "#E9ECF1", textColor: "#1D3A6B" },
  { name: "Purple", backgroundColor: "#EFEBF3", textColor: "#452861" },
];

export const getAutoTagColor = (name: string, type: string): string => {
  let hash = 0;
  for (const character of `${type}:${name}`) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return (
    COLOR_OPTIONS[hash % COLOR_OPTIONS.length]?.backgroundColor ?? COLOR_OPTIONS[0].backgroundColor
  );
};
