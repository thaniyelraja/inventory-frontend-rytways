import { useQuery } from "@tanstack/react-query";
import { message } from "antd";

const useAppQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    isError: false,
    ...options,
    onError:(error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
        options.onError?.error;
    }
  });
};

export default useAppQuery;
