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
}

const Home = () => {
  const [website, setWebsite] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
/*   const [page, setPage] = useState(1); */
  const [speedInstance, setSpeed] = useState<SpeedInstance | null>(null);

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

      (speedInstance as SpeedInstance)?.createCheckoutSession({
        currency: "BTC",
        amount: 0.00002,
        successUrl: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/dashboard`,
        cancelUrl:  `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/dashboard`,
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

/*   const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  }; */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight animate-bounce-slow">Rank4Sats</h1>
          <p className="text-lg font-semibold flex items-center space-x-2">
            <span>Be the first lucky visitor and earn</span>
            <span className="animate-pulse text-yellow-400">2500 Satoshis!</span>
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="bg-white p-8 rounded-lg shadow-lg mb-10 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center relative z-10">Get Your Website Ranked for Just 5000 Satoshis!</h2>
          <p className="text-gray-600 text-center mb-6 relative z-10">
            Join our ranking list and drive traffic to your website. If you&apos;re the first visitor to a new link, you&apos;ll instantly win 2500 satoshis. Take the chance!
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
            </button>
          </form>
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
