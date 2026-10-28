
"use client";

import { usePathname } from "next/navigation";

import OverviewPage from "../../components/admin/OverviewPage";
import OrdersPage from "../../components/admin/OrdersPage";
import AnalyticsPage from "../../components/admin/AnalyticsPage";
import AdminReviewsPage from "../../components/admin/AdminReviewsPage";
import DeliveryRangePage from "../../components/admin/DeliveryRangePage";
import MealsPage from "../../components/admin/MealsPage";

export default function AdminWorkspace() {
  const pathname = usePathname();

  switch (pathname) {
    case "/admin/orders":
      return <OrdersPage />;

    case "/admin/analytics":
      return <AnalyticsPage />;

    case "/admin/reviews":
      return <AdminReviewsPage />;

    case "/admin/range":
      return <DeliveryRangePage />;

    case "/admin/meals":
      return <MealsPage />;

    case "/admin":
    default:
      return <OverviewPage />;
  }
}
