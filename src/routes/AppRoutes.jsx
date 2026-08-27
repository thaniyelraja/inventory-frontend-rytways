import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import AppLayout from "../layouts/AppLayout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import ManageMaterials from "../pages/admin/ManageMaterials/ManageMaterials";
import ManageUsers from "../pages/admin/ManageUsers/ManageUsers";
import { ToastContainer } from "react-toastify";

const Login = lazy(() => import("../pages/Login/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Materials = lazy(() => import("../pages/Materials/Materials"));
const InventoryRequest = lazy(
  () => import("../pages/InventoryRequest/InventoryRequest"),
);
const AdminDashboard = lazy(
  () => import("../pages/admin/AdminDashboard/AdminDashboard"),
);
const ManageRequests = lazy(
  () => import("../pages/admin/ManageInventory/ManageRequests/ManageRequests"),
);
const ViewRequests = lazy(
  () => import("../pages/admin/ManageInventory/ViewRequests/ViewRequests"),
);
const Orders = lazy(() => import("../pages/admin/Orders/Orders"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {/*User */}
          <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/material" element={<Materials />} />
              <Route
                path="/inventory-requests"
                element={<InventoryRequest />}
              />
            </Route>
          </Route>
          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/materials" element={<ManageMaterials />} />
              <Route
                path="/admin/manage-requests"
                element={<ManageRequests />}
              />
              <Route path="/admin/view-requests" element={<ViewRequests />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/orders" element={<Orders />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={1500} limit={1} />
    </BrowserRouter>
  );
}

export default AppRoutes;
