export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || null;
};

export const isSuperAdmin = () => getUserRole() === "super_admin";
export const isAdmin = () => getUserRole() === "admin";
export const isEntryUser = () => getUserRole() === "user";
