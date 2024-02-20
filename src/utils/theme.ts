import { STORAGE_KEYS } from "./constant";

const mediaPrefersDarkScheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
);
mediaPrefersDarkScheme.addEventListener("change", () => updateTheme());

export const updateTheme = () => {
  const currentThemeType = localStorage.getItem(STORAGE_KEYS.THEME_TYPE);
  let isDark = mediaPrefersDarkScheme.matches;
  if (currentThemeType !== "system") {
    isDark = currentThemeType === "dark";
  }
  document.body.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};