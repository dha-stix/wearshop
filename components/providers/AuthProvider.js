"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthChange, signInWithGoogle, signOutUser, subscribeToUserProfile } from "@/lib/firebase-actions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [profile, setProfile] = useState({ uid: null, data: null });

  useEffect(() => onAuthChange((u) => setUser(u || null)), []);

  useEffect(() => {
    if (!user) return;
    const done = (data) => setProfile({ uid: user.uid, data });
    return subscribeToUserProfile(user.uid, done, () => done(null));
  }, [user]);

  const profileReady = !user || profile.uid === user.uid;

  const value = useMemo(
    () => ({
      user,
      profile: user ? profile.data : null,
      loading: user === undefined || !profileReady,
      isManager: Boolean(user && profile.data?.role === "manager"),
      signIn: signInWithGoogle,
      signOut: signOutUser,
    }),
    [user, profile, profileReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
