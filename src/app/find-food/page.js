// src/app/find-food/page.js
export default function FindFood() {
  return (
      <main className="min-h-screen pt-20">
          <div className="max-w-7xl mx-auto px-4 py-12">
              {/* Hero Section */}
              <div className="text-center mb-16">
                  <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                      Find Food Near You
                  </h1>
                  <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Connect with food providers in your area and get immediate assistance
                  </p>
              </div>

              {/* Search Section */}
              <div className="max-w-3xl mx-auto mb-16">
                  <div className="relative">
                      <input 
                          type="text"
                          placeholder="Enter your location"
                          className="w-full px-6 py-4 bg-gray-900 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="absolute right-2 top-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                          Search
                      </button>
                  </div>
              </div>

              {/* Available Food Listings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Example Card */}
                  <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/20">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-xl font-semibold text-white">Fresh Cooked Meals</h3>
                              <p className="text-gray-400">2.5 km away</p>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                              Available Now
                          </span>
                      </div>
                      <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                          Reserve Now
                      </button>
                  </div>
              </div>
          </div>
      </main>
  );
}