import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../me/me.api";

export const useMe = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
    retry: false,
  });
};
