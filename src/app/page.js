// src/app/page.js
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-purple-950/20">
      <div className="relative h-screen flex items-center justify-center px-4">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,29,149,0.15),transparent_70%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Hero Text */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
            No One Sleeps Hungry
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-purple-200/90 mb-12 max-w-2xl mx-auto">
            Join the movement to end hunger in our community
          </p>

          {/* Action Cards */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
            {/* Need Food Card */}
            <div className="group relative p-[1px] bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
              <Link href="/find-food" className="block">
                <div className="relative h-full bg-black rounded-2xl p-6 sm:p-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">I Need Food</h2>
                    <p className="text-purple-200/80">
                      Connect instantly with food providers near you
                    </p>
                    <span className="inline-flex items-center text-purple-300">
                      Get Started
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Have Food Card */}
            <div className="group relative p-[1px] bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
              <Link href="/share-food" className="block">
                <div className="relative h-full bg-black rounded-2xl p-6 sm:p-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">I Have Food</h2>
                    <p className="text-indigo-200/80">
                      Share your excess and make a direct impact
                    </p>
                    <span className="inline-flex items-center text-indigo-300">
                      Start Sharing
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">15K+</div>
              <div className="text-purple-200/70 text-sm">Meals Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">5K+</div>
              <div className="text-purple-200/70 text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">200+</div>
              <div className="text-purple-200/70 text-sm">Communities</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}