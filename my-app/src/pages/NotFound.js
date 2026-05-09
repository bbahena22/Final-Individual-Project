import React from 'react';
import Layout from '../components/Layout';

function NotFound() {
  return (
    <Layout>
      <div className="text-center mt-20">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-gray-600 mt-4">Page not found.</p>
      </div>
    </Layout>
  );
}

export default NotFound;
