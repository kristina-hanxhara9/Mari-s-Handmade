// Pre-render configuration for SEO
// This helps search engines crawl your React SPA

export const prerenderRoutes = [
  '/',
  '/shop',
  '/checkout',
];

// For future implementation with vite-plugin-ssr or similar
export const seoConfig = {
  defaultTitle: "Mari's Handmade Candles | Luxury Sculptural Candles UK",
  titleTemplate: "%s | Mari's Handmade",
  defaultDescription: "Discover exquisite handcrafted sculptural candles from Mari's Handmade. Luxury artisan candles hand-poured in the UK.",
  siteUrl: "https://marishandmade.co.uk",
  twitterHandle: "@marishandmade",
  facebookAppId: "",
};
