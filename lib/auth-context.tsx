"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserData {
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: unknown;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserProfileWithRole = async (
    uid: string,
    email: string,
    name: string,
  ): Promise<UserData["role"]> => {
    const userRef = doc(db, "users", uid);
    let role: UserData["role"] = "user";

    try {
      const usersSnapshot = await getDocs(
        query(collection(db, "users"), limit(1)),
      );
      role = usersSnapshot.empty ? "admin" : "user";
    } catch {
      role = "user";
    }

    await setDoc(
      userRef,
      {
        email,
        name,
        role,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );

    return role;
  };

  const recoverSingleAdminIfNeeded = async (uid: string) => {
    const adminsSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "admin"), limit(1)),
    );

    if (!adminsSnapshot.empty) return false;

    const usersSnapshot = await getDocs(collection(db, "users"));
    if (usersSnapshot.size !== 1) return false;

    await setDoc(doc(db, "users", uid), { role: "admin" }, { merge: true });
    return true;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const existingUserData = userDoc.data() as Partial<UserData>;
            const normalizedUserData: UserData = {
              email: existingUserData.email ?? firebaseUser.email ?? "",
              name:
                existingUserData.name ??
                firebaseUser.displayName?.trim() ??
                firebaseUser.email?.split("@")[0] ??
                "Usuario",
              role: existingUserData.role === "admin" ? "admin" : "user",
              createdAt: existingUserData.createdAt ?? new Date(),
            };

            if (!existingUserData.role) {
              await setDoc(
                userRef,
                { role: normalizedUserData.role },
                { merge: true },
              );
            }

            if (normalizedUserData.role !== "admin") {
              try {
                const wasPromoted = await recoverSingleAdminIfNeeded(
                  firebaseUser.uid,
                );
                if (wasPromoted) {
                  normalizedUserData.role = "admin";
                }
              } catch {
                // ignore recovery errors and continue with current role
              }
            }

            setUserData(normalizedUserData);
          } else {
            const fallbackName =
              firebaseUser.displayName?.trim() ||
              firebaseUser.email?.split("@")[0] ||
              "Usuario";
            const role = await createUserProfileWithRole(
              firebaseUser.uid,
              firebaseUser.email ?? "",
              fallbackName,
            );

            setUserData({
              email: firebaseUser.email ?? "",
              name: fallbackName,
              role,
              createdAt: new Date(),
            });
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        if (
          error instanceof FirebaseError &&
          error.code === "permission-denied" &&
          firebaseUser
        ) {
          setUserData({
            email: firebaseUser.email ?? "",
            name:
              firebaseUser.displayName?.trim() ||
              firebaseUser.email?.split("@")[0] ||
              "Usuario",
            role: "user",
            createdAt: new Date(),
          });
        } else {
          console.error("Error cargando perfil de usuario:", error);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    let assignedRole: UserData["role"];

    try {
      assignedRole = await createUserProfileWithRole(
        credential.user.uid,
        email,
        name,
      );
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "permission-denied"
      ) {
        throw new Error("firestore/permission-denied");
      }
      throw error;
    }

    setUserData({
      email,
      name,
      role: assignedRole,
      createdAt: new Date(),
    });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const isAdmin = userData?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, login, register, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
