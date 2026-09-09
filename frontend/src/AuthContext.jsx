import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("stalker_token")
  );

  const [officer, setOfficer] = useState(
    () => localStorage.getItem("stalker_officer") || "OFFICER"
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("stalker_token", token);
    } else {
      localStorage.removeItem("stalker_token");
    }
  }, [token]);

  useEffect(() => {
    if (officer) {
      localStorage.setItem("stalker_officer", officer);
    }
  }, [officer]);

  const login = (newToken, username) => {
    setToken(newToken);
    setOfficer(username || "OFFICER");
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("stalker_token");
    localStorage.removeItem("stalker_officer");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        officer,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}