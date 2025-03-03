<div align="center">
  <h1>SEVA</h1>
  <p><i>No One Sleeps Hungry</i></p>

[![Next.js](https://img.shields.io/badge/Next.js-13.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-API-red?style=for-the-badge&logo=google-maps)](https://developers.google.com/maps/)

</div>

## About SEVA

SEVA is a web platform designed to connect people with excess food to those who need it in their local community. The name "SEVA" means "selfless service" in Sanskrit, reflecting our mission to help reduce food waste while addressing hunger through community action.

### The Problem

- Food waste is a major issue, with significant amounts of edible food being thrown away
- Many people struggle with food insecurity, even in areas of plenty
- There's often a disconnect between those with excess food and those who need it

### Our Solution

SEVA provides a direct peer-to-peer platform that allows people to:
- Share food they can't use before it goes to waste
- Find available food in their community
- Connect through a simple, location-based interface

## Current Features

### Food Sharing
- Create food listings with details about what you're offering
- Set pickup locations using Google Maps integration
- Specify availability times and food descriptions

### Food Finding
- Browse available food listings in your area
- View food details and locations on a map
- Reserve food you're interested in

### User Experience
- User authentication (signup, login, logout)
- Dashboard to track your food listings and activity
- Mobile-responsive design

### Technical Implementation
- Real-time location-based food discovery
- User authentication and account management
- MongoDB database for storing user and listing information
- Google Maps integration for location services

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **Maps & Location**: Google Maps API
- **Deployment**: Ready for Vercel deployment

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB account
- Google Maps API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/seva.git
cd seva
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Future Development Goals

Features we're working on implementing:
- In-app messaging between food donors and recipients
- Real-time notifications for food availability
- Enhanced food safety guidelines and verification
- Community impact tracking
- Mobile app versions

## The Project

SEVA was developed as a hackathon project to address food waste and hunger issues in our communities. The project is in active development.

## Contact

For questions or contributions, please open an issue on this repository.

---

<div align="center">
  <p>Working toward a world where <b>No One Sleeps Hungry</b>.</p>
</div>
