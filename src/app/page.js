// src/app/page.js
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mt-16">
        {/* Hero Section */}
        <section
          className="relative h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-indigo-900"
        >
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Seva: Share Food, Share Love
            </h1>
            <p className="mt-4 text-xl text-gray-200">
              Connecting food donors with those in need to create lasting impact.
            </p>
            <div className="mt-8 flex justify-center gap-6">
              <Link
                href="/login"
                className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800">Our Mission</h2>
            <p className="mt-4 text-center text-gray-600 text-lg">
              At Seva, sharing food is sharing love. Our platform connects communities by linking those with extra food to neighbors in need.
            </p>
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-gray-800">For Food Donors</h3>
                <p className="mt-2 text-gray-600">
                  Easily list your extra food and help reduce waste while feeding those in need.
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-gray-800">For Food Recipients</h3>
                <p className="mt-2 text-gray-600">
                  Find nearby food donations quickly and securely from generous community members.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stories Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800">Real Stories, Real Impact</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600">
                  "Seva connected our community during a challenging time. Seeing neighbors support one another has revived our communal spirit."
                </p>
                <p className="mt-4 font-semibold text-gray-800">- Anjali M.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
                <p className="text-gray-600">
                  "Donating food through Seva was incredibly fulfilling. It's amazing how a simple act of generosity can change lives."
                </p>
                <p className="mt-4 font-semibold text-gray-800">- Rohit S.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} Seva. All rights reserved.</p>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:underline">Terms &amp; Conditions</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}