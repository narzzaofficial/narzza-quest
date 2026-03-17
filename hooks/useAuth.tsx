"use client";
import {
  createContext, useContext, useEffect,
  useState, ReactNode
} from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, User,
  GoogleAuthProvider, signInWithPopup,
  browserLocalPersistence, indexedDBLocalPersistence, setPersistence
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/db";
import { UserProfile } from "@/types";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: "player" | "gm"
  ) => Promise<void>;
  signInWithGoogle: (role: "player" | "gm") => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
      } catch (error) {
        console.warn("Gagal pakai indexedDBLocalPersistence, fallback ke browserLocalPersistence:", error);
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch (fallbackError) {
          console.warn("Gagal set auth persistence fallback:", fallbackError);
        }
      }

      unsubscribe = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const p = await getUserProfile(u.uid);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    };

    void initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: "player" | "gm"
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user.uid, {
      email,
      displayName,
      role,
    });
  };

  const signInWithGoogle = async (role: "player" | "gm") => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile(cred.user.uid, {
        email: cred.user.email || "",
        displayName: cred.user.displayName || "Hero",
        role,
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
