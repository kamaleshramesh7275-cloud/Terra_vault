"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type FontSize = "normal" | "large" | "xlarge";

interface FontContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontContext = createContext<FontContextType>({
  fontSize: "normal",
  setFontSize: () => {},
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    if (typeof document !== "undefined") {
      if (size === "normal") {
        document.documentElement.style.fontSize = "14px";
      } else if (size === "large") {
        document.documentElement.style.fontSize = "16px";
      } else if (size === "xlarge") {
        document.documentElement.style.fontSize = "18px";
      }
    }
  };

  useEffect(() => {
    // Set initial size
    setFontSize("normal");
  }, []);

  return (
    <FontContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  return useContext(FontContext);
}
