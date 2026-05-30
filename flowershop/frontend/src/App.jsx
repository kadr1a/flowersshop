import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header.jsx";
import Toast from "./components/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminFlowers from "./pages/admin/AdminFlowers.jsx";
import AdminSuppliers from "./pages/admin/AdminSuppliers.jsx";
import AdminSellers from "./pages/admin/AdminSellers.jsx";
import AdminLists from "./pages/admin/AdminLists.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminSupplierFlowers from "./pages/admin/AdminSupplierFlowers.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import { useAuthStore } from "./store/authStore.js";
import { useCartStore } from "./store/cartStore.js";
import { useFavoritesStore } from "./store/favoritesStore.js";

function MainLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

function AppRoutes() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchFavorites = useFavoritesStore((s) => s.fetchFavorites);
  const syncLocal = useFavoritesStore((s) => s.syncLocal);

  useEffect(() => {
    fetchMe().then((user) => {
      if (user) {
        syncLocal();
        fetchCart();
        fetchFavorites();
      }
    });
  }, [fetchMe, fetchCart, fetchFavorites, syncLocal]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="flowers" element={<AdminFlowers />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="lists" element={<AdminLists />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="supplier-flowers" element={<AdminSupplierFlowers />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
        <Route path="/*" element={<MainLayout />} />
      </Routes>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
