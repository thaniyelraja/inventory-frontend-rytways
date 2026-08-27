import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../utils/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
  });
};
