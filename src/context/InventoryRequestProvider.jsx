import { useState } from "react";
import { InventoryRequestContext } from "./InventoryRequestContext";

const InventoryRequestProvider = ({ children }) => {
  const [request, setRequest] = useState(false);
  const [requestItems, setRequestItems] = useState([]);

  return (
    <InventoryRequestContext.Provider
      value={{ request, setRequest, requestItems, setRequestItems }}
    >
      {children}
    </InventoryRequestContext.Provider>
  );
};

export default InventoryRequestProvider;
