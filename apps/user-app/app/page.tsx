import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            PayPro Wallet
          </h1>
          <p className="text-xl text-gray-600">
            Fast, secure, and easy money transfers
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Dashboard Card */}
          <Link href="/dashboard">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
              <p className="text-gray-600">
                View your balance and recent transactions
              </p>
            </div>
          </Link>

          {/* Transfer Card */}
          <Link href="/transfer">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
              <div className="text-4xl mb-4">💸</div>
              <h2 className="text-2xl font-bold mb-2">Send Money</h2>
              <p className="text-gray-600">
                Transfer funds to other users instantly
              </p>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <h3 className="text-3xl font-bold text-center mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-bold mb-2">Secure</h4>
              <p className="text-gray-600 text-sm">
                Bank-grade security for all transactions
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold mb-2">Instant</h4>
              <p className="text-gray-600 text-sm">
                Real-time P2P money transfers
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-bold mb-2">Easy to Use</h4>
              <p className="text-gray-600 text-sm">
                Simple and intuitive interface
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

