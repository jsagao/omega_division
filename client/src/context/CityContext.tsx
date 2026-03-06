import { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_CITY, getCityById } from "../lib/cityData";
import type { CityConfig } from "../lib/cityData";

interface CityContextValue {
  city: CityConfig;
  selectCity: (id: string) => void;
}

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  selectCity: () => {},
});

export function CityProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [city, setCity] = useState<CityConfig>(DEFAULT_CITY);

  const selectCity = useCallback((id: string) => {
    setCity(getCityById(id));
  }, []);

  return (
    <CityContext.Provider value={{ city, selectCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity(): CityContextValue {
  return useContext(CityContext);
}
