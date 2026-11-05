import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "../context/UserContext";

export const metadata: Metadata = {
  title: "Wayfarer — Honest Ratings, Fair Bookings",
  description:
    "Travel discovery and guided-tour booking platform featuring Bayesian honest ranking and concurrency-safe PostgreSQL reservations in Addis Ababa, Ethiopia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-100/60 text-slate-900 selection:bg-amber-500 selection:text-slate-950">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}

