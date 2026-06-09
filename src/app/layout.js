import "./globals.css";
import "./animations.css";
import "./responsive.css";

export const metadata = {
  title: "منصة المبدع التعليمية",
  description:
    "منصة المبدع التعليمية للمرحلة الإعدادية والثانوية بأفضل دعم علمي.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
