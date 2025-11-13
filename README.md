<div align="center">

# 🥋 Aikikainic

### Modern Aikido Dojo Management System

[![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A comprehensive web application for managing Aikido dojo operations, member registration, class schedules, and event coordination.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Screenshots](#-screenshots) • [Architecture](#-architecture)

---

</div>

## 📋 Overview

Aikikainic is a full-stack web application designed to streamline the management of Aikido dojos. Built with modern technologies and best practices, it provides a seamless experience for administrators, instructors, and students.

### 🎯 Key Features

- **👥 User Management**
  - Multi-role authentication (Webmaster | Admin | User)
  - Secure JWT-based authentication
  - Profile management and photo uploads
  
- **📅 Class Scheduling**
  - Dynamic schedule management
  - Real-time availability updates
  - Event creation and coordination

- **📸 Photo Gallery**
  - Event photo management
  - Secure image upload with Sharp processing
  - Gallery organization by events

- **🎫 Event Management**
  - Create and manage dojo events
  - Location tracking
  - Member registration system

- **🔐 Security First**
  - Rate limiting on sensitive endpoints
  - Helmet.js security headers
  - CORS configuration
  - Environment-based configuration

## 🛠 Tech Stack

### Frontend
- **Framework:** Angular 20.3 (Standalone Components)
- **Language:** TypeScript 5.9
- **Styling:** TailwindCSS 4.1
- **Animations:** GSAP, AOS
- **State Management:** Angular Signals
- **HTTP Client:** Angular HttpClient with Interceptors
- **Routing:** Angular Router with Guards
- **Testing:** Jasmine 4.5 + Karma 6.4
- **Notifications:** Custom Toast Notification System

### Backend
- **Runtime:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer + Sharp
- **Security:** Helmet, CORS, Express Rate Limit
- **Validation:** Custom middleware

### DevOps & Tools
- **Version Control:** Git
- **Linting:** ESLint with TypeScript support
- **Package Manager:** npm
- **Build Tool:** Angular CLI
- **Deployment:** Render (Backend)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Angular CLI (`npm install -g @angular/cli`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Robotic1804/aikikainic.git
   cd aikikainic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create environment files based on the templates:
   
   ```bash
   # Development environment
   cp src/environments/environment.ts.example src/environments/environment.ts
   
   # Production environment
   cp src/environments/environment.prod.ts.example src/environments/environment.prod.ts
   ```

4. **Configure environment variables**

   **Development** (`src/environments/environment.ts`):
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
   };
   ```

   **Production** (`src/environments/environment.prod.ts`):
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://aikikainic-backend.onrender.com',
   };
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:4200/`

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Starts the development server at `http://localhost:4200` |
| `npm run build` | Builds the project for production in `dist/` directory |
| `npm run watch` | Builds the project in watch mode for development |
| `npm test` | Runs unit tests via Karma |
| `npm run lint` | Lints the codebase using ESLint |

## 📁 Project Structure

```
aikikainic/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin-specific features
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # Authentication module
│   │   │   └── admin-login/    # Admin login feature
│   │   ├── pages/              # Page components
│   │   ├── shared/             # Shared components & utilities
│   │   │   ├── components/     # Reusable components
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── login-modal/
│   │   │   │   └── auth-menu/
│   │   │   └── register/       # Registration components
│   │   ├── services/           # API services
│   │   │   ├── horarios.service.ts
│   │   │   ├── modal.service.ts
│   │   │   └── photo.service.ts
│   │   ├── models/             # TypeScript interfaces
│   │   ├── pipes/              # Custom pipes
│   │   ├── user/               # User-related features
│   │   ├── webmaster/          # Webmaster utilities
│   │   ├── app.component.*     # Root component
│   │   ├── app.config.ts       # App configuration
│   │   └── app.routes.ts       # Routing configuration
│   ├── environments/           # Environment configs
│   ├── assets/                 # Static assets
│   ├── index.html              # Entry HTML
│   ├── main.ts                 # Application entry point
│   └── styles.css              # Global styles
├── angular.json                # Angular CLI configuration
├── eslint.config.js            # ESLint configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # You are here!
```


## 🔌 API Integration

The frontend communicates with the backend API through the following services:

### Authentication Service
```typescript
// Login
POST /api/auth/login
POST /api/auth/registro
POST /api/auth/logout

// Password Management
POST /api/auth/solicitar-reset-password
POST /api/auth/reset-password
```

### Admin Service
```typescript
// Admin Operations
GET  /api/admin/users
POST /api/admin/create-user
PUT  /api/admin/users/:id
```

### Events & Schedule
```typescript
// Events
GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id

// Locations
GET    /api/locations
POST   /api/locations
```

### Photos
```typescript
// Photo Management
GET    /api/photos
POST   /api/photos/upload
DELETE /api/photos/:id
```

## 🏗 Architecture

### Design Patterns

- **Standalone Components:** Modern Angular approach without NgModules
- **Signal-based State:** Reactive state management using Angular Signals
- **Service Layer Pattern:** Business logic separated in services
- **Repository Pattern:** Data access abstraction
- **Guard Pattern:** Route protection with Angular Guards
- **Interceptor Pattern:** HTTP request/response transformation

### Key Architectural Decisions

1. **Standalone Components:** Embracing Angular's latest architecture for better tree-shaking and lazy loading
2. **Signal-based Reactivity:** Leveraging Angular 20's signals for fine-grained reactivity
3. **Modular Structure:** Feature-based organization for scalability
4. **Environment Configuration:** Separate configs for dev/prod environments
5. **Type Safety:** Strong TypeScript typing throughout the application

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ HTTP-only cookies for token storage
- ✅ CORS configuration
- ✅ XSS protection
- ✅ Rate limiting on authentication endpoints
- ✅ Input validation and sanitization
- ✅ Secure password hashing (bcrypt)

## 🎨 UI/UX Features

- 📱 Fully responsive design
- 🌙 Modern, clean interface
- ⚡ Fast page transitions
- 🎭 Smooth animations with GSAP
- 🎯 Intuitive navigation
- ♿ Accessibility compliant

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in headless mode
npm test -- --browsers=ChromeHeadless

# Run tests with coverage
npm test -- --code-coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# The build artifacts will be stored in the `dist/` directory
# Optimized for production with:
# - AOT compilation
# - Tree-shaking
# - Minification
# - Bundle optimization
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to your hosting provider

### Backend Connection

Ensure the `environment.prod.ts` file points to your production backend:
```typescript
apiUrl: 'https://aikikainic-backend.onrender.com/api'
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow the Angular Style Guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Norman Navarro**

- Portfolio: [www.norman-webdesigner.com]
- LinkedIn: [https://www.linkedin.com/in/norm-frontend-developer/]
- GitHub: [@Robotic1804](https://github.com/Robotic1804)
- Email: norman-navarro@norman-webdesigner.com

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- The Aikido community for inspiration
- Open source contributors

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ and 🥋 by Norman

</div>