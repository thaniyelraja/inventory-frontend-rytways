import { useState } from "react";
import { InventoryRequestContext } from "./InventoryRequestContext";

const InventoryRequestProvider = ({ children }) => {
  const [request, setRequest] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [requestSingleOpen, setRequestSingleOpen] = useState(false);

  return (
    <InventoryRequestContext.Provider
      value={{
        request,
        setRequest,
        requestItems,
        setRequestItems,
        requestSingleOpen,
        setRequestSingleOpen,
      }}
    >
      {children}
    </InventoryRequestContext.Provider>
  );
};

export default InventoryRequestProvider;
