'use client';

import React, { useEffect, useState } from 'react';

interface RankedWebsite {
  id: number;
  url: string;
}

const Home = () => {
  const [website, setWebsite] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rankedWebsites, setRankedWebsites] = useState<RankedWebsite[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [speedInstance, setSpeed] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Speed) {
      const speedInstance1 = new window.Speed(process.env.NEXT_PUBLIC_SPEED_PK);
      console.log(speedInstance1);
      setSpeed(speedInstance1);
    }
  }, []);

  const isValidUrl = (url: string) => {
    const httpsRegex = /^https:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/;
    return httpsRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUrl(website)) {
      setErrorMessage('Please enter a valid website URL that starts with https://');
      return;
    }

    setErrorMessage(null);
    setIsModalOpen(true);

    const response = await fetch('/api/registerWebsite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ website }),
    });

    if (response.ok) {
      const responseJson = await response.json();
      const siteId = responseJson.siteId;

      console.log(siteId);

      speedInstance.createCheckoutSession({
        currency: "BTC",
        amount: 0.00005,
        successUrl: process.env.NEXT_PUBLIC_DOMAIN_NAME + "/confirmedPayment",
        cancelUrl: process.env.NEXT_PUBLIC_DOMAIN_NAME,
        successMessage: "Payment successful! Your website is now set to be featured in our premium listing, making it accessible to the public.",
        paymentMethods: ["lightning"],
        metadata: {
          siteId: siteId
        }
      });
    } else {
      console.error('Error registering website');
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Animated Title */}
            <h1 className="text-4xl font-bold tracking-tight animate-bounce-slow">Rank4Sats</h1>
          </div>
          <p className="text-lg font-semibold flex items-center space-x-2">
            <span>Be the first lucky visitor and earn</span>
            <span className="animate-pulse text-yellow-400">2500 Satoshis!</span>
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="bg-white p-8 rounded-lg shadow-lg mb-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-2xl"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center relative z-10">Get Your Website Ranked for Just 5000 Satoshis!</h2>
          <p className="text-gray-600 text-center mb-6 relative z-10">
            Join our ranking list and drive traffic to your website. If you're the first visitor to a new link, you’ll instantly win 2500 satoshis. Take the chance!
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <input
              type="text"
              name="website"
              placeholder="Enter your website URL"
              className="p-3 w-full border rounded-lg text-black focus:outline-none focus:border-purple-600 transition"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Rank My Website for 5000 Sats
              <svg xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c2.21 0 4-1.79 4-4S14.21 0 12 0 8 1.79 8 4s1.79 4 4 4zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/>
              </svg>
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Top Ranked Websites</h2>
          <ul className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            {rankedWebsites.map((site) => (
              <li key={site.id} className="border-b pb-2">
                <a href={site.url} className="text-blue-600 hover:underline">
                  {site.url}
                </a>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex justify-between mt-6">
            <button
              disabled={page === 1}
              onClick={handlePreviousPage}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={handleNextPage}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Important Notice</h2>
            <p className="text-gray-600">
              Links to illegal content or websites that promote harmful activities will be removed from our platform. Please ensure that your website complies with legal standards.
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2024 Rank4Sats - Give rewards while boosting your website's visibility.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
