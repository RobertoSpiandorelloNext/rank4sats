'use client'
import React, { useEffect, useState } from 'react';

interface SpeedInstance {
  createCheckoutSession: (options: {
    currency: string;
    amount: number;
    successUrl: string;
    cancelUrl: string | undefined;
    successMessage: string;
    paymentMethods: string[];
    metadata: {
      siteId: string;
    };
  }) => void;
  createAWithdrawSession: (options: {
    amount: number;
    currency: string;
  }) => void;
}

type RankedSite = {
  id: number;
  url: string;
  first_visitor_paid: boolean;
};

const Home = () => {
  const [website, setWebsite] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
/*   const [page, setPage] = useState(1); */
  const [speedInstance, setSpeed] = useState<SpeedInstance | null>(null);
  const [rankedSites, setRankedSites] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Speed) {
      const speedInstance1 = new window.Speed(process.env.NEXT_PUBLIC_SPEED_PK);
      console.log(speedInstance1);
      setSpeed(speedInstance1);
    }

    const fetchRankedSites = async (page: number) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/getRankedSites?page=${page}&limit=10`);
        if (!response.ok) {
          throw new Error(`Error fetching ranked sites: ${response.statusText}`);
        }
  
        const data = await response.json();
        setRankedSites(data.rankedSites);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);

      } catch (err) {
        if (err instanceof Error) {
          console.error('Error:', err.message);
          setError(err.message);
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
   
    fetchRankedSites(page);
  // react-hooks/exhaustive-deps
  }, [page]);

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

      (speedInstance as SpeedInstance)?.createCheckoutSession({
        currency: "SATS",
        amount: 2000,
        successUrl: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}`,
        cancelUrl:  `${process.env.NEXT_PUBLIC_DOMAIN_NAME}`,
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

  const handleWithdraw = async () => {
    try {
      const amount = 1000
      const currency = 'SATS'
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Error making withdrawal request');
      }

      const data = await response.json();
      window.location.href = data.url;
      console.log('API Response:', data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleClick = async (id: number) => {
    try {
      const response = await fetch(`/api/getRankedSites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.site.first_visitor_paid === true) {

          handleWithdraw();

          console.log('Reward paid to the first visitor.');
        }

      } else {
        console.error('Failed to update the site.');
      } 
    } catch (error) {
      console.error('Error clicking the link:', error);
    }
  };

/*   const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  }; */

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
          <h1 className="text-4xl font-bold tracking-tight animate-bounce-slow">Rank4Sats</h1>
          <p className="text-lg font-semibold flex items-center space-x-2">
            <span>Be the first lucky visitor and earn</span>
            <span className="animate-pulse text-yellow-400">1000 Satoshis!</span>
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="bg-white p-8 rounded-lg shadow-lg mb-10 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center relative z-10">
            Get Your Website Ranked for Just 2000 Satoshis!
          </h2>
          <p className="text-gray-600 text-center mb-6 relative z-10">
            Join our ranking list and drive traffic to your website. If you&apos;re the first visitor to a new link, you&apos;ll instantly win 1000 satoshis. Take the chance!
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
              Rank My Website for 2000 Sats
            </button>
          </form>
        </section>

        {/* Ranking Table Section */}
        <section className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ranked Websites</h2>
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">URL</th>
                <th className="border border-gray-300 px-4 py-2 bg-gray-100">Action</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={2} className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                    <span>There are no sites registered yet</span>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={2} className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                rankedSites.map((site: RankedSite) => (
                  <tr key={site.id}>
                    <td className="border border-gray-300 px-4 py-2 text-blue-600 hover:underline">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick(site.id);
                        }}
                        className={site.first_visitor_paid ? 'text-gray-400 pointer-events-none' : ''}
                      >
                        {site.url}
                      </a>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {site.first_visitor_paid ? (
                        <span className="text-green-600 font-semibold">A lucky visitor has already claimed the sats</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleClick(site.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                          >
                            Try Your Luck and Earn Some Satoshis
                          </button>
                          <p className="text-xs text-gray-500 mt-1">Luck for the first access only!</p>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
          </tbody>
          </table>
          <div className="mt-4 flex justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages || currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-400 disabled:opacity-50"
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
          <p className="text-sm">© 2024 Rank4Sats - Give rewards while boosting your website&apos;s visibility.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
