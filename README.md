# ShortStop - URL Shortener

A full-stack URL shortening service with analytics, QR code generation, and user authentication. Built with Node.js, Express, PostgreSQL, and EJS.

**🌐 Live Demo:** [https://tinyapp-production-12b4.up.railway.app](https://tinyapp-production-12b4.up.railway.app)

---

## Features

### Core Functionality
- **URL Shortening** - Convert long URLs into short, shareable links
- **User Authentication** - Secure registration and login with bcrypt password hashing
- **Personal Dashboard** - Manage all your shortened URLs in one place
- **Click Analytics** - Track clicks with daily charts and total counts
- **QR Code Generation** - Generate QR codes for any shortened URL
- **Copy to Clipboard** - One-click copying of shortened URLs

### Security & Privacy
- Session-based authentication with encrypted cookies
- Password hashing with bcryptjs
- User-specific URL management (only owners can edit/delete)
- No IP tracking by default (privacy-focused)

---

## Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/0ad1754f-b891-4b6e-905a-45e14dd69552)

### URL Management Dashboard
![URL Dashboard](https://github.com/user-attachments/assets/a9567a60-fa53-49cf-af65-fc79bdfc831b)

### Quick Edit Modal
![Quick Edit](https://github.com/user-attachments/assets/d2497b0e-610c-47c2-9dc0-407640d0710e)

### Analytics Dashboard
![Analytics](https://github.com/user-attachments/assets/75ec4631-a3a1-4dfd-b492-392c2a2efbac)
Track clicks over time with interactive charts and view total engagement metrics.

---

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **PostgreSQL** - Relational database with JSONB support
- **bcryptjs** - Password hashing
- **cookie-session** - Session management

### Frontend
- **EJS** - Server-side templating
- **Bootstrap** - Responsive UI framework
- **Chart.js** - Analytics visualizations
- **Custom CSS** - Styled components

### Additional Tools
- **QRCode** - QR code generation library
- **method-override** - RESTful routing support

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id VARCHAR(6) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- URLs
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  user_id VARCHAR(6) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  click_count INTEGER DEFAULT 0
);

-- Clicks (Analytics)
CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  url_id INTEGER REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);
```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Lakonas/tinyapp.git
cd tinyapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
# Create database
createdb tinyapp

# Run schema
psql tinyapp -f config/schema.sql
```

4. **Configure environment variables**
```bash
# Create .env file (optional for local development)
PORT=8080
DATABASE_URL=postgresql://localhost/tinyapp
BASE_URL=http://localhost:8080
```

5. **Start the development server**
```bash
npm start
```

6. **Visit the app**
```
http://localhost:8080
```

---

## Usage

### Creating Short URLs
1. Register for an account or log in
2. Click "Create New URL"
3. Paste your long URL
4. Receive a shortened URL instantly

### Managing URLs
- **Edit** - Update the destination URL
- **Delete** - Remove URLs you no longer need
- **Analytics** - View click statistics and charts
- **QR Code** - Generate and download QR codes

### Sharing
- Copy the short URL with one click
- Share via QR code
- Track engagement through analytics

---

## API Endpoints

### Public Routes
- `GET /` - Home page (redirects to login or URLs)
- `GET /u/:shortCode` - Redirect to long URL
- `GET /register` - Registration page
- `GET /login` - Login page
- `POST /register` - Create new account
- `POST /login` - Authenticate user
- `POST /logout` - End session

### Protected Routes (Requires Authentication)
- `GET /urls` - View all user URLs
- `GET /urls/new` - Create new URL form
- `GET /urls/:id` - View single URL details
- `GET /urls/:id/analytics` - View URL analytics
- `GET /urls/:id/qr` - Generate QR code
- `POST /urls` - Create new short URL
- `PUT /urls/:id` - Update URL
- `DELETE /urls/:id` - Delete URL

---

## Deployment

This app is deployed on **Railway** with PostgreSQL.

**Live URL:** [https://tinyapp-production-12b4.up.railway.app](https://tinyapp-production-12b4.up.railway.app)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Railway)
- `BASE_URL` - Production URL for QR codes and copy functionality
- `PORT` - Auto-configured by Railway (defaults to 8080 locally)

### Deployment Steps
1. Connect GitHub repository to Railway
2. Add PostgreSQL database service
3. Set `BASE_URL` environment variable to your Railway app URL
4. Railway automatically deploys on push to `master` branch

### Database Setup
The PostgreSQL schema is automatically applied using the `schema.sql` file in the `config/` directory.

---

## Project Structure

```
tinyapp/
├── config/
│   ├── database.js          # PostgreSQL connection
│   └── schema.sql            # Database schema
├── helpers/
│   └── utils.js              # Helper functions
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── User.js               # User database model
│   ├── Url.js                # URL database model
│   └── Click.js              # Click analytics model
├── routes/
│   ├── authRoutes.js         # Login/register routes
│   └── urlRoutes.js          # URL management routes
├── views/
│   ├── partials/
│   │   └── _header.ejs       # Header partial
│   ├── urls_index.ejs        # URL list page
│   ├── urls_new.ejs          # Create URL page
│   ├── urls_show.ejs         # URL details page
│   ├── urls_analytics.ejs    # Analytics page
│   ├── login.ejs             # Login page
│   └── register.ejs          # Registration page
├── public/
│   └── styles/
│       └── main.css          # Custom styles
├── server.js                 # Application entry point
└── package.json              # Dependencies
```

---

## Development

### Running Tests
```bash
npm test
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

---

## Design Decisions

### Why PostgreSQL?
- **Relational integrity** - URLs belong to users, clicks belong to URLs
- **JSONB support** - Flexible data storage for future features
- **Performance** - Efficient indexing for analytics queries
- **Production-ready** - ACID compliance for data integrity

### Why Session-Based Auth?
- **Simplicity** - No token refresh complexity
- **Security** - Encrypted cookies, server-side validation
- **Stateful** - Easy to invalidate on server

### Why EJS?
- **Server-side rendering** - Fast initial page loads
- **SEO-friendly** - Fully rendered HTML
- **Simple** - No complex client-side state management needed

---

## Future Enhancements

- [ ] Custom short codes (user-defined aliases)
- [ ] Link expiration dates
- [ ] Password-protected links
- [ ] Bulk URL import via CSV
- [ ] API token authentication (JWT) for programmatic access
- [ ] Advanced analytics (geographic data, referrer tracking)
- [ ] Link preview with Open Graph metadata
- [ ] Team collaboration features
- [ ] Custom domains for branded short links

---

## Contributing

This is a portfolio project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Bill Katsoulis**
- GitHub: [@Lakonas](https://github.com/Lakonas)
- Project: [ShortStop](https://tinyapp-production-12b4.up.railway.app)

---

## Acknowledgments

- Originally started as a project for [Lighthouse Labs](https://www.lighthouselabs.ca/) Web Development Bootcamp
- Significantly enhanced with PostgreSQL database, analytics dashboard, QR code generation, and production deployment
- Inspired by bit.ly and similar URL shortening services
- Deployed on [Railway](https://railway.app/)

---

**⭐ If you found this project interesting, please consider giving it a star!**
