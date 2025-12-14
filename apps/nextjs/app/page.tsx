import { Metadata } from 'next'
import ProductList from '@/components/Product/ProductList'
import { generateStructuredData, generateSocialMeta } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Home - Modern Product Management',
  description: 'Browse and manage your product catalog with our modern CRUD application. Built with WordPress REST API and Next.js for optimal performance.',
  keywords: ['products', 'CRUD', 'WordPress', 'Next.js', 'e-commerce', 'product management'],
  ...generateSocialMeta({
    title: 'Product CRUD App - Modern Product Management',
    description: 'Browse and manage products with our modern CRUD application',
    type: 'website',
  }),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
}

export default function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Website structured data
  const websiteSchema = generateStructuredData({
    type: 'WebSite',
    name: 'Product CRUD App',
    url: baseUrl,
    description: 'Modern product management application built with WordPress REST API and Next.js',
  })

  // Organization structured data
  const organizationSchema = generateStructuredData({
    type: 'Organization',
    name: 'Product CRUD App',
    url: baseUrl,
    sameAs: [
      'https://twitter.com/yourhandle',
      'https://github.com/yourusername',
    ],
  })

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Product Management
                <span className="block text-blue-600 mt-2">Made Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create, manage, and organize your product catalog with ease. 
                Built with modern technologies for optimal performance.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>SEO Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Fast Performance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-8">
          <ProductList />
        </section>

        {/* Features Section */}
        <section className="bg-white border-t border-gray-200 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your product catalog efficiently
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Creation</h3>
                <p className="text-gray-600">
                  Add new products quickly with our intuitive form interface
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Updates</h3>
                <p className="text-gray-600">
                  Edit product details instantly with real-time validation
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Optimized for speed with caching and lazy loading
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Built With Modern Technology
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Leveraging the best tools for performance, SEO, and user experience
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {[
                { name: 'Next.js 16', color: 'bg-black text-white' },
                { name: 'WordPress', color: 'bg-blue-600 text-white' },
                { name: 'TypeScript', color: 'bg-blue-500 text-white' },
                { name: 'Tailwind CSS', color: 'bg-cyan-500 text-white' },
                { name: 'SWR', color: 'bg-orange-500 text-white' },
                { name: 'Docker', color: 'bg-blue-400 text-white' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className={`${tech.color} px-6 py-3 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-shadow`}
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Product CRUD App. Built with ❤️ using WordPress & Next.js
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
