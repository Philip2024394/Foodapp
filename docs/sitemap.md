# FoodApp Sitemap (Multi-App)

## Customer App
- Home: `/`
- Landing (PWA prompt, onboarding): `/landing`
- Food Directory (browse vendors): `/directory`
- Street Food (discover nearby): `/street-food`
- Vendor Page (menu, info): `/vendors/:vendorId`
- Cart: `/cart`
- Checkout: `/checkout`
- Reviews: `/vendors/:vendorId/reviews`
- Profile: `/profile`
  - Bookings: `/profile/bookings`
  - Favorites: `/profile/favorites`
  - Settings: `/profile/settings`
- Chat (support/vendor messaging): `/chat`

## Vendor App
- Dashboard: `/vendor`
  - Orders: `/vendor/orders`
  - Menu Management: `/vendor/menu`
  - Availability Calendar: `/vendor/availability`
  - Reviews: `/vendor/reviews`
  - Promotions & Share Proofs: `/vendor/promotions`
  - Media (logo/header uploads): `/vendor/media`

## Admin App
- Dashboard: `/admin`
  - Vendors Management: `/admin/vendors`
  - Users Management: `/admin/users`
  - Products/Items: `/admin/products`
  - Orders: `/admin/orders`
  - Reviews: `/admin/reviews`
  - Bookings: `/admin/bookings`
  - Notifications: `/admin/notifications`
  - Loyalty Points: `/admin/loyalty`
  - Game Prizes: `/admin/game-prizes`
  - Storage (media audits): `/admin/storage`

## Delivery App (optional)
- Fleet Dashboard: `/delivery`
  - Assigned Orders: `/delivery/orders`
  - Route & Map: `/delivery/route`
  - History: `/delivery/history`

## Support/CS App (optional)
- Tickets: `/support/tickets`
- Live Chat: `/support/chat`
- User/Vendor lookup: `/support/lookup`

## Shared Components & Context
- Use shared components in `components/common/` to keep UX consistent across apps.
- Auth & Data contexts in `context/` provide session, navigation, and repositories.

## Route & Naming Conventions
- Kebab-case for paths (e.g., `/game-prizes`, `/share-proofs`).
- Resource-first routes under app namespaces (`/admin/vendors`, `/vendor/orders`).
- Entity detail routes use `/:id` (e.g., `/vendors/:vendorId`).

## Future Integrations
- Payments: `/checkout/payment`
- Real-time order tracking: `/orders/:orderId/track`
- Push notifications settings: `/profile/notifications`
