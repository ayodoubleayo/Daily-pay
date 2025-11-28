// app/admin/layout.jsx
import AdminWrapper from "./wrapper";

export const metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({ children }) {
  return <AdminWrapper>{children}</AdminWrapper>;
}
