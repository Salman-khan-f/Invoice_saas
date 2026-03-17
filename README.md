# InvoiceFlow – Invoice Management SaaS Platform

A full-stack SaaS platform for freelancers and small businesses to create, manage, and track invoices. Built with **Spring Boot**, **Vite React**, and **MongoDB Atlas**.

---

## 🗂 Project Structure

```
invoice-saas/
├── backend/          # Spring Boot REST API
└── frontend/         # Vite + React SPA
```

---

## ⚙️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Vite, React 18, TailwindCSS, React Query |
| Backend    | Spring Boot 3.2, Java 17                |
| Database   | MongoDB Atlas                           |
| Auth       | JWT (jjwt 0.12)                         |
| PDF        | iText 7                                 |
| Email      | Spring Mail (SMTP)                      |

---

## 🚀 Quick Start

### 1. Clone & Configure

```bash
git clone <your-repo>
cd invoice-saas
```

### 2. Backend Setup

**Prerequisites:** Java 17+, Maven 3.8+

Edit `backend/src/main/resources/application.properties`:

```properties
# MongoDB Atlas – replace with your connection string
spring.data.mongodb.uri=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/invoicesaas

# JWT – use a long random string (256+ bits)
app.jwt.secret=YourSuperSecretKey...

# Email – Gmail example
spring.mail.username=your@gmail.com
spring.mail.password=your-app-password

# Frontend URL for CORS
app.frontend.url=http://localhost:5173
```

```bash
cd backend
mvn spring-boot:run
# API runs at http://localhost:8080
```

### 3. Frontend Setup

**Prerequisites:** Node.js 18+

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 🔑 API Endpoints

### Auth
| Method | URL                    | Description        |
|--------|------------------------|--------------------|
| POST   | `/api/auth/register`   | Register & get JWT |
| POST   | `/api/auth/login`      | Login & get JWT    |
| GET    | `/api/auth/me`         | Current user info  |

### Clients
| Method | URL                  | Description         |
|--------|----------------------|---------------------|
| GET    | `/api/clients`       | List all clients    |
| POST   | `/api/clients`       | Create client       |
| PUT    | `/api/clients/{id}`  | Update client       |
| DELETE | `/api/clients/{id}`  | Soft-delete client  |

### Invoices
| Method | URL                            | Description             |
|--------|--------------------------------|-------------------------|
| GET    | `/api/invoices`                | List all invoices       |
| POST   | `/api/invoices`                | Create invoice          |
| GET    | `/api/invoices/{id}`           | Get invoice detail      |
| PUT    | `/api/invoices/{id}`           | Update invoice          |
| DELETE | `/api/invoices/{id}`           | Cancel invoice          |
| POST   | `/api/invoices/{id}/payments`  | Record payment          |
| PATCH  | `/api/invoices/{id}/status`    | Update status           |
| GET    | `/api/invoices/{id}/pdf`       | Download PDF            |
| POST   | `/api/invoices/{id}/send-email`| Email invoice to client |

### Dashboard
| Method | URL                    | Description       |
|--------|------------------------|-------------------|
| GET    | `/api/dashboard/stats` | Revenue & stats   |

---

## 🏗️ Features

- ✅ Multi-tenant architecture (each company has isolated data)
- ✅ JWT authentication
- ✅ Client management (CRUD)
- ✅ Invoice creation with line items, tax, discount
- ✅ Auto invoice number generation (`INV-2025-0001`)
- ✅ PDF invoice generation (iText 7)
- ✅ Email invoice to client (SMTP)
- ✅ Payment recording (full & partial)
- ✅ Invoice status: DRAFT → PENDING → PAID / OVERDUE / PARTIAL
- ✅ Dashboard with revenue chart (last 6 months)
- ✅ Responsive dark UI

---

## 📦 Build for Production

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/invoice-backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## 🔒 Environment Variables (Production)

For production, use environment variables instead of hardcoding in `application.properties`:

```bash
export SPRING_DATA_MONGODB_URI="mongodb+srv://..."
export APP_JWT_SECRET="your-secret"
export SPRING_MAIL_USERNAME="email@gmail.com"
export SPRING_MAIL_PASSWORD="app-password"
```

---

## 📝 Notes

- **MongoDB Atlas**: Create a free cluster at https://cloud.mongodb.com. Whitelist `0.0.0.0/0` for development.
- **Gmail SMTP**: Enable 2FA and create an App Password at https://myaccount.google.com/apppasswords
- **PDF generation**: iText 7 AGPL – for commercial use, get a commercial license or use an alternative like Apache PDFBox.
