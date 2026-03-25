export type ColorScheme = "dark" | "light";

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  card: string;
  cardBorder: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  textFaint: string;
  input: string;
  inputBorder: string;
  inputFilled: string;
  inputFilledBorder: string;
  headerBg: string;
  separator: string;
  tabInactive: string;
  restCard: string;
  tipBg: string;
  tipBorder: string;
  clearBtnBg: string;
  clearBtnBorder: string;
  dropdownBg: string;
  statusBar: "light" | "dark";
}

export const DARK: ThemeColors = {
  bg: "#111111",
  bgSecondary: "#1a1a1a",
  card: "#1a1a1a",
  cardBorder: "#2a2a2a",
  cardAlt: "#222222",
  text: "#ffffff",
  textMuted: "#aaaaaa",
  textFaint: "#555555",
  input: "#222222",
  inputBorder: "#333333",
  inputFilled: "#0f2a18",
  inputFilledBorder: "#22c55e",
  headerBg: "#1a1a1a",
  separator: "#252525",
  tabInactive: "#555555",
  restCard: "#1e1e1e",
  tipBg: "#1a1a1a",
  tipBorder: "#333333",
  clearBtnBg: "#1a0a0a",
  clearBtnBorder: "#3a1a1a",
  dropdownBg: "#222222",
  statusBar: "light",
};

export const LIGHT: ThemeColors = {
  bg: "#f2f2f7",
  bgSecondary: "#ffffff",
  card: "#ffffff",
  cardBorder: "#e5e5ea",
  cardAlt: "#f9f9f9",
  text: "#000000",
  textMuted: "#3c3c43",
  textFaint: "#8e8e93",
  input: "#f2f2f7",
  inputBorder: "#c6c6c8",
  inputFilled: "#dcfce7",
  inputFilledBorder: "#22c55e",
  headerBg: "#ffffff",
  separator: "#e5e5ea",
  tabInactive: "#8e8e93",
  restCard: "#f9f9f9",
  tipBg: "#f9f9f9",
  tipBorder: "#e5e5ea",
  clearBtnBg: "#fff1f2",
  clearBtnBorder: "#fecdd3",
  dropdownBg: "#ffffff",
  statusBar: "dark",
};

export function getTheme(scheme: ColorScheme): ThemeColors {
  return scheme === "dark" ? DARK : LIGHT;
}
