// src/app/layout.js
import './globals.css'
import Navbar from '@/components/shared/Navbar'
import { SocketProvider } from '@/context/SocketContext';

export const metadata = {
  title: 'SEVA - No One Sleeps Hungry',
  description: 'Connect food donors with people in need',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <SocketProvider>
          <Navbar />
          {children}
        </SocketProvider>
      </body>
    </html>
  )
}