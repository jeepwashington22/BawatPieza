"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

export type UserProfile = {
  id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  role: "admin" | "staff";
  contactNo: string;
  status: string;
  is_active: boolean;
  created_at: string;
};

const emptyUser: UserProfile = { id: "", firstname: "", middlename: "", lastname: "", email: "", role: "staff", contactNo: "", status: "", is_active: false, created_at: "" };

const UserContext = createContext<{ user: UserProfile; loading: boolean; refresh: () => void }>({ user: emptyUser, loading: true, refresh: () => {} });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(emptyUser);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) { setUser(emptyUser); return; }
      const { data } = await supabase.from("user_accounts").select("id, firstname, middlename, lastname, email, role, contactNo, status, is_active, created_at").eq("id", authData.user.id).single();
      if (data) {
        setUser({ id: data.id, firstname: data.firstname ?? "", middlename: data.middlename ?? "", lastname: data.lastname ?? "", email: data.email ?? authData.user.email ?? "", role: data.role === "admin" ? "admin" : "staff", contactNo: data.contactNo ?? "", status: data.status ?? "", is_active: Boolean(data.is_active), created_at: data.created_at });
      } else {
        const meta = authData.user.user_metadata ?? {};
        const fullName = meta.full_name ?? "";
        const parts = fullName.split(" ");
        setUser({ id: authData.user.id, firstname: meta.firstname ?? parts[0] ?? "", middlename: meta.middlename ?? (parts.length > 2 ? parts[1] : ""), lastname: meta.lastname ?? parts[parts.length - 1] ?? "", email: authData.user.email ?? "", role: meta.role === "admin" ? "admin" : "staff", contactNo: meta.contactNo ?? "", status: "active", is_active: true, created_at: authData.user.created_at });
      }
    } catch {
      setUser(emptyUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  return <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}