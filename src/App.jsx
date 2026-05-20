import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";

// Protected Pages
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import { OrdersPage, OrderDetailPage } from "./pages/OrdersPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminChat from "./pages/admin/AdminChat";


// Layout wrapper (Navbar + Footer)
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);


// Route Wrappers (clean code approach)
const withLayout = (Component) => (
  <Layout>
    <Component />
  </Layout>
);

const protectedRoute = (Component) => (
  <ProtectedRoute>
    {withLayout(Component)}
  </ProtectedRoute>
);

const adminRoute = (Component) => (
  <ProtectedRoute adminOnly>
    <Component />
  </ProtectedRoute>
);


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={withLayout(HomePage)} />
            <Route path="/products" element={withLayout(ProductsPage)} />
            <Route path="/products/:id" element={withLayout(ProductDetailPage)} />
            <Route path="/cart" element={withLayout(CartPage)} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />

            {/* Protected Routes */}
            <Route path="/checkout" element={protectedRoute(CheckoutPage)} />
            <Route path="/profile" element={protectedRoute(ProfilePage)} />
            <Route path="/orders" element={protectedRoute(OrdersPage)} />
            <Route path="/orders/:id" element={protectedRoute(OrderDetailPage)} />

            {/* Admin Routes */}
            <Route path="/admin" element={adminRoute(AdminDashboard)} />
            <Route path="/admin/products" element={adminRoute(AdminProducts)} />
            <Route path="/admin/orders" element={adminRoute(AdminOrders)} />
            <Route path="/admin/chat" element={adminRoute(AdminChat)} />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                    <p className="text-9xl font-bold text-gray-800">404</p>
                    <p className="text-3xl font-bold text-white">Page Nahi Mila</p>
                    <p className="text-gray-500">
                      Jo page dhundh rahe ho woh exist nahi karta
                    </p>
                    <a href="/" className="btn-primary px-8 py-3 mt-2">
                      Home Pe Jao →
                    </a>
                  </div>
                </Layout>
              }
            />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}