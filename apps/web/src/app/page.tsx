import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            OrderBridge
          </Link>
          <nav className="flex gap-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">
              Marketplace
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order from local sellers
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Browse sellers, place orders, and manage everything in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/marketplace"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Browse marketplace
            </Link>
            <Link
              href="/auth/register"
              className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              Become a seller
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
