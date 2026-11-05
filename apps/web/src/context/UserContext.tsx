"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../lib/types";
import { api } from "../lib/api";

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  switchUser: (user: User) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  isLoading: true,
  switchUser: () => { },
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await api.getUsers();
        setUsers(fetchedUsers);

        if (fetchedUsers.length > 0) {
          const storedUserId = localStorage.getItem("wayfarer_active_user_id");
          const matched = fetchedUsers.find((u) => u.id === storedUserId);
          const active = matched || fetchedUsers[0];
          setCurrentUser(active);
          api.setActiveUserId(active.id);
          localStorage.setItem("wayfarer_active_user_id", active.id);
        }
      } catch (err) {
        console.error("Failed to load users for switcher:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    api.setActiveUserId(user.id);
    localStorage.setItem("wayfarer_active_user_id", user.id);
  };

  return (
    <UserContext.Provider value={{ currentUser, users, isLoading, switchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useActiveUser() {
  return useContext(UserContext);
}

