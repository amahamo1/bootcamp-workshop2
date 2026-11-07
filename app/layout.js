// app/layout.js
// The HTML shell that wraps every page.
import "./globals.css";

// TODO(team): change the title to your app's name
export const metadata = { title: "SoDA Hackathon Starter" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
