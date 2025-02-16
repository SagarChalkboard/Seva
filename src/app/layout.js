// src/app/layout.js
import './globals.css'
import Navbar from '@/components/shared/Navbar'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Navbar />
        {children}
      </body>
    </html>
  )
}