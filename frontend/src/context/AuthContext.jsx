import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Force login on every app load - no auto-login from localStorage
  const [user, setUser] = useState(null);

  // Sync user state with localStorage, clear all auth data on logout
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  const login = (data) => {
    console.log("Login called with data:", data);
    console.log("User data:", data.user);
    console.log("User role:", data.user?.role);
    
    localStorage.setItem("token", data.token);
    setUser(data.user);
    
    console.log("User set in context:", data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
