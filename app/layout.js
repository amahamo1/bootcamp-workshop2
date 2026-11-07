// app/layout.js
// The HTML shell that wraps every page.
import "./globals.css";

export const metadata = {
  title: "nearwise | Local Price Finder",
  description: "Compare verified prices from retailers near you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
