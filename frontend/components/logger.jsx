"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

const UserLogger = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log("Email:", user.primaryEmailAddress?.emailAddress);
      console.log("Username:", user.username);
    }
  }, [isLoaded, user]);

  return null;
};

export default UserLogger;
