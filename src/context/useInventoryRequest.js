import { useContext } from "react";
import { InventoryRequestContext } from "./InventoryRequestContext";

export const useInventoryRequest = () => {
  return useContext(InventoryRequestContext);
};
