import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {MockShopNotice} from '~/components/MockShopNotice';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Cozy Clothing | Neo-Brutal Store'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  try {
    const [{collections}, {products}] = await Promise.all([
      context.storefront.query(FEATURED_COLLECTION_QUERY),
      context.storefront.query(HOMEPAGE_PRODUCTS_QUERY),
      // Add other queries here, so that they are loaded in parallel
    ]);

    return {
      isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
      featuredCollection: collections.nodes[0],
      homepageProducts: products.nodes,
    };
  } catch (error) {
    console.error(error);
    return {
      isShopLinked: false,
      featuredCollection: null,
      homepageProducts: [],
    };
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  return (
    <div className="home cozy-home">
      {data.isShopLinked ? null : <MockShopNotice />}

      <section className="cozy-hero">
        <div className="cozy-hero-art">
          <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src="/assets/hero-video.mp4" type="video/mp4" />
            <img src="/assets/product1/WhatsApp Image 2026-04-19 at 11.59.47 AM.jpeg" alt="Cozy Clothing hero" />
          </video>
        </div>
        
        <div className="cozy-hero-copy">
          <img src="/assets/main_logo.png" alt="Cozy Clothing" className="cozy-logo" />
          <p className="cozy-kicker">Premium Collection</p>
          <h1>Elevate Your Comfort</h1>
          <p>
            Discover the new standard in everyday luxury. Meticulously crafted for those who demand both style and substance.
          </p>
          <div className="cozy-hero-ctas">
            <Link to="/collections" className="premium-btn">
              Shop the Collection
            </Link>
            <Link to="/products" className="premium-btn premium-btn-alt">
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      <TickerStrip />

      <FeaturedCollection collection={data.featuredCollection} />

      <section className="cozy-products">
        <div className="section-head">
          <h2>Latest Arrivals</h2>
          <p>Explore our newest signature pieces.</p>
        </div>
        <div className="cozy-products-grid">
          {(data.homepageProducts.length ? data.homepageProducts : [
            {id: 'fallback-1', title: 'Cozy Silk Blouse', handle: '/collections', featuredImage: null, priceRange: {minVariantPrice: {amount: '999', currencyCode: 'INR'}}},
            {id: 'fallback-2', title: 'Minimalist Overcoat', handle: '/collections', featuredImage: null, priceRange: {minVariantPrice: {amount: '999', currencyCode: 'INR'}}},
            {id: 'fallback-3', title: 'Essential Knit', handle: '/collections', featuredImage: null, priceRange: {minVariantPrice: {amount: '999', currencyCode: 'INR'}}},
            {id: 'fallback-4', title: 'Tailored Trousers', handle: '/collections', featuredImage: null, priceRange: {minVariantPrice: {amount: '999', currencyCode: 'INR'}}},
          ]).map((product) => (
            <Link key={product.id} className="cozy-product-card" to={product.handle.startsWith('/') ? product.handle : `/products/${product.handle}`}>
              {product.featuredImage ? (
                <Image
                  data={product.featuredImage}
                  alt={product.featuredImage.altText || product.title}
                  sizes="(min-width: 45em) 32vw, 100vw"
                />
              ) : (
                <img src="/assets/product2/WhatsApp Image 2026-04-19 at 11.59.47 AM.jpeg" alt={product.title} />
              )}
              <div className="cozy-product-meta">
                <h3>{product.title}</h3>
                <strong>
                  <Money data={product.priceRange.minVariantPrice} />
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <LookbookGrid />

      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function TickerStrip() {
  return (
    <section className="cozy-ticker" aria-label="Cozy announcements">
      <p>
        COMPLIMENTARY SHIPPING ON ORDERS OVER 5000 INR &nbsp; | &nbsp; PREMIUM QUALITY GUARANTEED &nbsp; | &nbsp; DESIGNED WITH ELEGANCE &nbsp; | &nbsp; COMPLIMENTARY SHIPPING ON ORDERS OVER 5000 INR
      </p>
    </section>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <section className="cozy-featured">
      <Link className="featured-collection" to={`/collections/${collection.handle}`}>
        {image ? (
          <div className="featured-collection-image">
            <Image
              data={image}
              sizes="100vw"
              alt={image.altText || collection.title}
            />
          </div>
        ) : (
          <div className="featured-collection-image">
             <img src="/assets/product3/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg" alt="Featured Collection" />
          </div>
        )}
        <div className="featured-collection-text">
          <p>Curated Selection</p>
          <h2>{collection.title || 'The Essentials'}</h2>
          <span>Explore Collection</span>
        </div>
      </Link>
    </section>
  );
}

function LookbookGrid() {
  const shots = [
    '/assets/product4/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product5/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product6/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product7/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product8/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product9/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product1/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg',
    '/assets/product2/WhatsApp Image 2026-04-19 at 11.59.47 AM.jpeg',
  ];

  return (
    <section className="cozy-lookbook">
      <div className="section-head">
        <h2>The Lookbook</h2>
        <p>A closer look at our signature fits and fabric details.</p>
      </div>
      <div className="cozy-lookbook-grid">
        {shots.map((src, i) => (
          <div key={i}>
            <img src={src} alt="Cozy Clothing lookbook" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <section className="recommended-products cozy-recommended" aria-labelledby="recommended-products">
      <div className="section-head">
        <h2 id="recommended-products">You May Also Like</h2>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="cozy-products-grid" style={{padding: '0 2rem', marginBottom: '4rem'}}>
              {response
                ? response.products.nodes.map((product) => (
                    <Link key={product.id} className="cozy-product-card" to={`/products/${product.handle}`}>
                      {product.featuredImage ? (
                        <Image
                          data={product.featuredImage}
                          alt={product.featuredImage.altText || product.title}
                          sizes="(min-width: 45em) 32vw, 100vw"
                        />
                      ) : (
                        <img src="/assets/product3/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg" alt={product.title} />
                      )}
                      <div className="cozy-product-meta">
                        <h3>{product.title}</h3>
                        <strong>
                          <Money data={product.priceRange.minVariantPrice} />
                        </strong>
                      </div>
                    </Link>
                  ))
                : [
                    {id: 'fallback-r1', title: 'Premium Basic Tee', handle: '/collections', featuredImage: null, priceRange: {minVariantPrice: {amount: '999', currencyCode: 'INR'}}},
                    {id: 'fallback-r2', title: 'Signature Hoodie', handle: '/collections', featuredImage: null, priceRange: {minVariantPrice: {amount: '999', currencyCode: 'INR'}}},
                  ].map((product) => (
                    <Link key={product.id} className="cozy-product-card" to={product.handle}>
                      <img src="/assets/product4/WhatsApp Image 2026-04-19 at 11.59.48 AM.jpeg" alt={product.title} />
                      <div className="cozy-product-meta">
                        <h3>{product.title}</h3>
                        <strong>
                          <Money data={product.priceRange.minVariantPrice} />
                        </strong>
                      </div>
                    </Link>
                  ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

const HOMEPAGE_PRODUCTS_QUERY = `#graphql
  fragment HomeProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query HomepageProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
