import { createContext, useContext, useState, useCallback } from 'react';

// Lets teachers/admins preview the app as a student would see it.
// Persisted so a refresh inside preview stays in preview.
const ViewModeContext = createContext({ preview: false, setPreview: () => {} });
const KEY = 'uf_preview_student';

export function ViewModeProvider({ children }) {
  const [preview, setPreviewState] = useState(() => localStorage.getItem(KEY) === '1');
  const setPreview = useCallback(v => {
    setPreviewState(v);
    if (v) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  }, []);
  return <ViewModeContext.Provider value={{ preview, setPreview }}>{children}</ViewModeContext.Provider>;
}

export const useViewMode = () => useContext(ViewModeContext);
