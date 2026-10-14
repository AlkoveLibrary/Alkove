import React, { createContext, useCallback, useEffect, useState } from "react";
import {
  loginRequest,
  logoutRequest,
  getSelfRequest,
  loginWithMfaRequest,
} from "../requests/auth";
import { UserWithRole } from "types/user";
import { LoginMfaParams, MFARequiredResponse } from "types/auth";

type AuthContextState = {
  user: UserWithRole | null;
  login: (
    email: string,
    password: string,
  ) => Promise<void | MFARequiredResponse>;
  loginWithMfa: (body: LoginMfaParams) => Promise<void>;
  logout: () => Promise<void>;
  logoutNoRequest: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextState>({
  user: null,
  login: async () => {},
  loginWithMfa: async () => {},
  logout: async () => {},
  logoutNoRequest: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);

  const fetchUser = useCallback(async () => {
    const data = await getSelfRequest();
    setUser(data.user ?? null);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    if ("mfaRequired" in response && response.mfaRequired) {
      return response;
    } else {
      if ("user" in response) setUser(response.user);
    }
  };

  const loginWithMfa = async (body: LoginMfaParams) => {
    const response = await loginWithMfaRequest(body);
    setUser(response.user);
  };

  async function logout() {
    setUser(null);
    await logoutRequest();
  }

  async function logoutNoRequest() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithMfa,
        logout,
        logoutNoRequest,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
