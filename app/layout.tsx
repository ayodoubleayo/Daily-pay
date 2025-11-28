import "./globals.css";
import ClientLayout from "./ClientLayout";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Ecommerce Frontend",
  description: "Frontend for your ecommerce app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Required for responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
