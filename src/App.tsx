import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddSale from "./pages/AddSale";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import AddCustomer from "./pages/AddCustomer";
import Sales from "./pages/Sales";
import Cashbook from "./pages/Cashbook";
import AddExpense from "./pages/AddExpense";
import Settings from './pages/Settings';
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-sale"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddSale />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddSale />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomerDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-customer"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddCustomer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashbook"
            element={
              <ProtectedRoute>
                <Layout>
                  <Cashbook />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-expense"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddExpense />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
