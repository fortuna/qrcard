# Product Requirements Document (PRD): viniCard

## 1. Product Overview
**viniCard** is a modern, self-contained, offline-first digital business card web application. It allows users to quickly generate, download, and edit vCard-compliant QR codes entirely within their browser without sending personal data to a backend server. 

## 2. Target Audience
Professionals, networkers, and individuals who want a polished, track-free, and easy-to-use digital business card that can be instantly scanned by any mobile phone native camera.

## 3. Core Features
- **Heroic Start Screen:** Triage users initially to either create a new card or update an old one. Features "BY VINI" branding linked to the creator.
- **Trust & Privacy Section:** A dedicated landing section highlighting Local Encoding, Zero Tracking, and Future-Proof architecture.
- **Form Data Entry:** Simple, responsive input fields for First Name, Last Name, Organization, Title, Phone, Email, Website, and Notes.
- **Real-Time QR Generation:** The QR code renders and updates instantly on the canvas as the user types.
- **vCard 3.0 Compliance:** Standardized contact format structure with an automatic `REV` ISO-8601 timestamp version string.
- **QR Code Download:** Users can download their generated QR code as a `.png` file, with the filename automatically pulling the internal vCard sequence timestamp (e.g., `viniCard-20260324T003434Z.png`).
- **Upload & Edit (Reverse Engineering):** Users can seamlessly upload a previously downloaded viniCard QR image. The system scans the image, decodes the vCard payload, and auto-populates the input fields for fast editing.
- **Raw Data Viewer:** Developers or power users can toggle the raw text representation of the vCard data.
- **Zero Tracking:** 100% offline generation in the browser. 
- **Browser History Support:** Full support for browser back/forward buttons and deep linking (`#edit`) for a seamless single-page application experience.
## 4. Technical Specifications
- **Stack:** Vanilla JavaScript, HTML5, Vanilla CSS3.
- **Tooling:** Vite for local dev server and optimized production build (`dist/`).
- **Dependencies:** `qrcode` (for drawing QR canvas), `jsqr` (for decoding uploaded images), `lucide` (icons).
- **Deployment:** GitHub Pages (served from `vinicard.app` root domain) via automated GitHub Actions pipeline (`deploy.yml`).

## 5. Aesthetics & UI/UX
- Mobile-first, responsive grid layout prioritizing single-column readability on smaller devices.
- Dark mode theme featuring a rich glassmorphism aesthetic, subtle gradients, and a futuristic neon purple glow behind the primary branding.
- Entry Screen Branding Animation: The logo dynamically transitions from "vCard" to "viniCard" on initial page load for a high-end feel.
- Precise hover transitions and subtle micro-animations to invoke a premium, modern feel.
