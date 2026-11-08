## 1. Product Requirements Document (PRD)

**Product Name:** Al Falah Art Custom Printing Platform
**Objective:** Digitize a local printing and graphic design workflow, enabling online enquiries, quotation generation, design proof approvals, and payments, without replacing the owner's core design tools (CorelDRAW/InPage).
**Target Audience:**

1. **Customers (B2C & B2B):** Local/regional clients needing custom prints (wedding cards, posters). Requires multi-language support (Urdu, Hindi, English) and low friction (no forced sign-ups).
2. **Business Owner (Admin):** Non-technical user managing enquiries, pricing, design uploads, and production tracking via a mobile-friendly dashboard.

## 2. Customer Journey

1. **Discovery:** Customer visits the site, views services, and explores the design gallery for reference samples.
2. **Enquiry Submission:** Customer selects a category (e.g., Wedding Card) and fills out a specialized form. They upload references and input text (Urdu/Hindi/English).
3. **Tracking & Quotation:** Customer receives a unique tracking link/ID. The admin reviews the requirements and issues a quotation.
4. **Acceptance:** Customer reviews the quote via their link and accepts or rejects it.
5. **Proof Review:** Admin uploads a design proof. Customer views the proof and either requests revisions or approves it.
6. **Payment:** Customer pays the required advance or full amount via Razorpay.
7. **Fulfillment:** Customer tracks the order through production to dispatch or shop pickup.

## 3. Admin Workflow

1. **Dashboard Overview:** Admin logs in and sees pending enquiries, awaiting proofs, and outstanding payments.
2. **Review & Quote:** Admin opens a new enquiry, assesses the custom requirements, inputs pricing, and sends the quotation.
3. **Design & Upload:** Admin creates the design offline (CorelDRAW) and uploads exported JPEGs/PDFs as proofs to the specific order.
4. **Revision Loop:** If the customer requests changes, the admin uploads a new version.
5. **Payment Verification:** Admin monitors incoming Razorpay payments or manually logs offline cash payments.
6. **Production Tracking:** Admin updates the order status (In Production -> Ready for Pickup/Completed).

## 4. MVP Features vs. Postponed Features

| Feature Category   | MVP Scope                                                     | Postponed to Future Phases                                |
| ------------------ | ------------------------------------------------------------- | --------------------------------------------------------- |
| **Authentication** | Secure JWT Admin Login. Guest tracking links for customers.   | Full customer user accounts/passwords; Multi-admin roles. |
| **Notifications**  | Manual sharing of tracking links via WhatsApp/Email.          | Automated WhatsApp Business API integration.              |
| **Payments**       | Razorpay integration (Advance/Full) + Manual offline logging. | Complex tax configurations or subscription billing.       |
| **File Storage**   | Cloudinary integration for uploads and proofs.                | Direct integration with local CorelDRAW file system.      |
| **Analytics**      | Basic monthly counts (Orders, Revenue).                       | Advanced data visualization and customer lifetime value.  |

## 5. System Architecture

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query (React Query) for state/caching, React Hook Form + Zod.
- **Backend:** Node.js, Express.js, TypeScript. Monolithic API serving JSON.
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Storage:** Cloudinary (handles image optimization and format conversion).
- **Payments:** Razorpay.
- **Design Pattern:** Modular Feature-based API (Route -> Middleware -> Controller -> Service -> Model).

## 6. Project Folder Structure

```text
al-falah-art/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── assets/             # Static images, fonts
│   │   ├── components/         # Reusable UI (shadcn, forms, layout)
│   │   ├── features/           # Feature-based modules (admin, public, customer)
│   │   ├── hooks/              # Custom React hooks (TanStack queries)
│   │   ├── lib/                # Axios instance, utility functions
│   │   ├── pages/              # Route entry points
│   │   ├── routes/             # React Router configuration
│   │   ├── store/              # Global state (Zustand - if needed)
│   │   └── types/              # Frontend TypeScript interfaces
│   └── package.json
└── server/                     # Node.js Backend
    ├── src/
    │   ├── config/             # Env vars, DB connection, Cloudinary, Razorpay
    │   ├── constants/          # Status enums, default values
    │   ├── controllers/        # Request handling, response formatting
    │   ├── middlewares/        # Auth, error handling, validation, multer
    │   ├── models/             # Mongoose schemas
    │   ├── routes/             # Express route definitions (v1)
    │   ├── services/           # Core business logic
    │   ├── types/              # Backend TypeScript interfaces
    │   └── utils/              # Helpers (logger, hashers, catchAsync)
    ├── .env
    └── package.json

```

## 7. Database Schema & Relationships

- **User (Admin):** `_id`, `name`, `email`, `passwordHash`, `role` (admin).
- **Customer:** `_id`, `name`, `phone`, `email`, `address`. (Created automatically upon first enquiry based on phone number).
- **Category:** `_id`, `name`, `slug`, `description`, `isActive`.
- **DesignSample:** `_id`, `categoryId` (Ref), `title`, `image`, `description`, `tags`.
- **Enquiry:** `_id`, `customerId` (Ref), `type` (wedding/poster/general), `status`, `data` (JSON/Embedded schema based on type), `references` (Array of URLs).
- **Quotation:** `_id`, `enquiryId` (Ref), `items` (Array), `subTotal`, `discount`, `totalAmount`, `advanceRequired`, `status` (Pending/Accepted/Rejected).
- **Order:** `_id`, `quotationId` (Ref), `customerId` (Ref), `status`, `trackingToken`.
- **DesignProof:** `_id`, `orderId` (Ref), `version`, `fileUrl`, `notes`, `status` (Pending/Approved/Revision).
- **Payment:** `_id`, `orderId` (Ref), `razorpayOrderId`, `razorpayPaymentId`, `amount`, `status`, `type` (Advance/Balance/Full), `method` (Online/Offline).

## 8. API Endpoint Plan (v1)

- **Auth:**
- `POST /api/v1/auth/login` (Admin login -> HttpOnly cookie)
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

- **Catalog (Public & Admin):**
- `GET /api/v1/categories`, `POST /api/v1/categories` (Admin)
- `GET /api/v1/samples`, `POST /api/v1/samples` (Admin)

- **Enquiries:**
- `POST /api/v1/enquiries` (Public)
- `GET /api/v1/enquiries` (Admin)
- `GET /api/v1/enquiries/:id` (Admin/Customer via Token)

- **Quotations:**
- `POST /api/v1/quotes` (Admin)
- `PATCH /api/v1/quotes/:id/status` (Customer Accept/Reject)

- **Orders & Proofs:**
- `GET /api/v1/orders` (Admin)
- `GET /api/v1/orders/track/:trackingToken` (Public)
- `POST /api/v1/orders/:id/proofs` (Admin)
- `PATCH /api/v1/orders/:orderId/proofs/:proofId/status` (Customer Approve)

- **Payments:**
- `POST /api/v1/payments/create-order` (Customer)
- `POST /api/v1/payments/webhook` (Razorpay)
- `POST /api/v1/payments/offline` (Admin)

## 9. Authentication and Authorization Strategy

- **Admin Access:** Secured via JWT stored in an `HttpOnly` cookie. This prevents XSS attacks from stealing the token. Role-based middleware ensures only the owner can access `/api/v1/...` protected routes.
- **Customer Access (Low Friction):** No password required. When an enquiry is created, the system generates a secure, cryptographically random `trackingToken`. Customers access their quote, approve proofs, and pay via URLs like `[alfalahart.com/track/abc123xyz](https://alfalahart.com/track/abc123xyz)`. This token is verified on the backend for specific customer-facing routes.

## 10. Secure Razorpay Payment Workflow

1. **Initiation:** Customer clicks "Pay Advance". Frontend calls `/payments/create-order`.
2. **Server Order:** Backend uses Razorpay Node SDK to create an order and returns `razorpayOrderId` and `amount` to the frontend.
3. **Checkout:** Frontend opens Razorpay Checkout.
4. **Verification:** Upon success, Razorpay hits the backend webhook (`/payments/webhook`).
5. **Idempotency & Security:** Backend verifies the HMAC SHA256 signature of the webhook. It checks if the payment was already processed (idempotency) and updates the Order and Payment records. _Never trust frontend success callbacks for fulfilling orders._

## 11. File Storage and Design-Proof Workflow

1. **Enquiry Uploads:** Customer frontend uploads reference images directly to Cloudinary (using restricted, unsigned upload presets) or via the Node backend, storing URLs in the Enquiry record.
2. **Proof Uploads:** Admin exports proofs from CorelDRAW. Admin frontend uploads to Cloudinary via backend (signed uploads for security).
3. **Security:** Internal files (like CorelDRAW `.cdr` files, if ever supported) should go to a private S3 bucket. Public proofs (JPEGs) can stay on Cloudinary with watermarks applied via Cloudinary's transformation API to prevent unauthorized downloading before payment.

## 12. Deployment Architecture

- **Phase 1 (MVP - Managed Hosting):**
- Frontend: Vercel (Auto CI/CD from GitHub).
- Backend: Render or Railway (managed Node.js environments).
- Database: MongoDB Atlas (Free or Serverless tier).

- **Phase 2 (Your Preferred Linux Workflow):**
- Move backend to an AWS EC2 instance running Ubuntu.
- Containerize the backend with Docker.
- Set up Nginx as a reverse proxy, handling SSL termination (Let's Encrypt), rate limiting, and routing traffic to the Node container.

## 13. Phased Implementation Roadmap

- **Phase 1:** Architecture & Planning _(Complete with this document)_.
- **Phase 2:** Project Foundation (Monorepo setup, Express boilerplate, Vite setup, Tailwind/shadcn init).
- **Phase 3:** Public Website & Catalog (Categories, Samples, Grid UI).
- **Phase 4:** Enquiry System (Dynamic forms for Weddings/Posters, Cloudinary uploads).
- **Phase 5:** Admin & Quotation Management (Dashboard, Auth, Quote Builder, Magic Links).
- **Phase 6:** Orders & Design Approval (Proof uploads, versioning, customer approval UI).
- **Phase 7:** Payments (Razorpay integration, Webhooks).
- **Phase 8:** Final Polish & Deployment (Testing, Error Boundaries, Vercel/EC2 setup).

---

**Identified Assumptions & Missing Requirements:**

1. **Shopping Cart:** Assumed _not_ required. This is a lead-generation/quotation model, not a standard e-commerce add-to-cart model. Each enquiry represents one distinct order flow.
2. **Notification Fallback:** Assumed the Admin will manually copy the `trackingToken` link from the dashboard and send it to the customer via their personal/business WhatsApp for the MVP.
