import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Instant Tailwind CSS Engine */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
