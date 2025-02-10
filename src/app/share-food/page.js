// src/app/share-food/page.js
export default function ShareFood() {
    return (
        <main className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                        Share Food With Your Community
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Your excess can end someone's hunger today
                    </p>
                </div>

                {/* Sharing Form */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-8 border border-purple-500/20">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    What food would you like to share?
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g., Cooked meals, groceries, fresh produce"
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 text-sm">
                                    Pickup Location
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Enter address for pickup"
                                    className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-lg font-semibold transition-all duration-200"
                            >
                                Share Now
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}