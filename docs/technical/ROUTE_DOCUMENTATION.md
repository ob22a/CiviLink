# Backend API Route Documentation

This document provides a comprehensive overview of all backend API routes, their authentication requirements, and expected request/response formats.

## Base URL

- **Local Development**: `http://localhost:5000/api/v1`
- **Production**: Set via `VITE_API_BASE_URL` environment variable

## Authentication

All protected routes require authentication via HTTP-only cookies. The `accessToken` cookie is automatically sent by the browser with each request when `credentials: 'include'` is set.

### Cookie-Based Authentication

- **Cookie Name**: `accessToken`
- **Cookie Attributes**: HttpOnly, Secure (in production), SameSite
- **Token Type**: JWT (JSON Web Token)
- **Token Payload**: `{ id: userId, role: userRole }`

### Role-Based Access Control

- **citizen**: Regular users who submit applications
- **officer**: Government officers who process applications (departments: approver, customer_support)
- **admin**: System administrators with full access

---

## 1. Authentication Routes

**Base Path**: `/api/v1/auth`

### POST `/register`

Register a new citizen user.

- **Auth**: Public
- **Request Body**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string",
    "acceptTerms": true
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "string", "email": "string", "role": "citizen" }
    }
  }
  ```

### POST `/login`

Login user and set authentication cookie.

- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": false
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id": "string", "email": "string", "role": "string" }
    }
  }
  ```
- **Sets Cookie**: `accessToken` (HttpOnly)

### POST `/logout`

Logout user and clear authentication cookie.

- **Auth**: Protected (any authenticated user)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### POST `/refresh-token`

Refresh access token using refresh token from cookie.

- **Auth**: Public (requires refresh token cookie)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "string", "email": "string", "role": "string" }
    }
  }
  ```

### GET `/google`

Initiate Google OAuth flow.

- **Auth**: Public
- **Redirects to**: Google OAuth consent screen

### GET `/google/callback`

Google OAuth callback handler.

- **Auth**: Public (handled by Passport)
- **Redirects to**: Frontend with auth status

---

## 2. User Routes

**Base Path**: `/api/v1/user`

All user routes require authentication.

### GET `/profile`

Get current user's profile information.

- **Auth**: Protected (any authenticated user)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "role": "string",
        "createdAt": "date"
      }
    }
  }
  ```

### PATCH `/change-password`

Change user password.

- **Auth**: Protected (any authenticated user)
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

### GET `/id/data`

Get extracted ID data (Fayda and Kebele).

- **Auth**: Protected (any authenticated user)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "faydaData": { "fullName": "string", "idNumber": "string", ... },
      "kebeleData": { "fullName": "string", "idNumber": "string", ... }
    }
  }
  ```

### POST `/id/upload/fayda`

Upload and process Fayda ID using OCR.

- **Auth**: Protected (any authenticated user)
- **Content-Type**: `multipart/form-data`
- **Request Body**: FormData with `id_image` file
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Fayda ID processed successfully",
    "data": { "extractedData": {...} }
  }
  ```

### POST `/id/upload/kebele`

Upload and process Kebele ID using OCR.

- **Auth**: Protected (any authenticated user)
- **Content-Type**: `multipart/form-data`
- **Request Body**: FormData with `id_image` file
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Kebele ID processed successfully",
    "data": { "extractedData": {...} }
  }
  ```

### DELETE `/id/:idType`

Delete ID information (Right to Be Forgotten).

- **Auth**: Protected (any authenticated user)
- **Params**: `idType` - "fayda", "kebele", or "both"
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "ID information deleted successfully"
  }
  ```

---

## 3. Application Routes (Citizen)

**Base Path**: `/api/v1/applications`

### GET `/`

Get all applications for the current citizen.

- **Auth**: Protected (role: citizen)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "applications": [
        {
          "id": "string",
          "type": "TIN | BIRTH | MARRIAGE | DEATH",
          "status": "pending | approved | rejected",
          "createdAt": "date",
          ...
        }
      ]
    }
  }
  ```

### GET `/:id/download`

Download certificate for approved application.

- **Auth**: Protected (role: citizen)
- **Params**: `id` - Application ID
- **Response** (200): PDF file stream
- **Content-Type**: `application/pdf`

---

## 4. TIN Application Routes

**Base Path**: `/api/v1/tin`

### POST `/applications`

Submit a new TIN application.

- **Auth**: Protected (role: citizen)
- **Middleware**: `checkIdsUploaded`, `assignApproverOfficer`
- **Request Body**:
  ```json
  {
    "businessName": "string",
    "businessType": "string",
    "address": "string",
    ...
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "TIN application submitted successfully",
    "data": { "application": {...} }
  }
  ```

### POST `/applications/:id/approve`

Approve a TIN application (officer).

- **Auth**: Protected (role: officer)
- **Params**: `id` - Application ID
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Application approved successfully"
  }
  ```

### POST `/applications/:id/reject`

Reject a TIN application (officer).

- **Auth**: Protected (role: officer)
- **Params**: `id` - Application ID
- **Request Body**:
  ```json
  {
    "reason": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Application rejected successfully"
  }
  ```

---

## 5. Vital Records Routes

**Base Path**: `/api/v1/vital`

### POST `/:type/applications`

Submit a vital record application (birth, marriage, death).

- **Auth**: Protected (role: citizen)
- **Middleware**: `checkIdsUploaded`, `assignApproverOfficer`
- **Params**: `type` - "birth", "marriage", or "death"
- **Request Body**: Varies by type
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Application submitted successfully",
    "data": { "application": {...} }
  }
  ```

### POST `/:type/applications/:id/approve`

Approve a vital record application (officer).

- **Auth**: Protected (role: officer)
- **Params**: 
  - `type` - "birth", "marriage", or "death"
  - `id` - Application ID
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Application approved successfully"
  }
  ```

### POST `/:type/applications/:id/reject`

Reject a vital record application (officer).

- **Auth**: Protected (role: officer)
- **Params**: 
  - `type` - "birth", "marriage", or "death"
  - `id` - Application ID
- **Request Body**:
  ```json
  {
    "reason": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Application rejected successfully"
  }
  ```

---

## 6. Officer Routes

**Base Path**: `/api/v1/officer`

All officer routes require authentication and officer role.

### GET `/applications`

Get all applications assigned to the current officer.

- **Auth**: Protected (role: officer)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "applications": [...]
    }
  }
  ```

### GET `/applications/:id`

Get detailed information about a specific application.

- **Auth**: Protected (role: officer)
- **Params**: `id` - Application ID
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "application": {...},
      "citizen": {...}
    }
  }
  ```

### GET `/metrics`

Get performance metrics for the current officer.

- **Auth**: Protected (role: officer)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "totalProcessed": 0,
      "approved": 0,
      "rejected": 0,
      "pending": 0,
      "avgProcessingTime": 0
    }
  }
  ```

### GET `/activities`

Get recent activity logs for the current officer.

- **Auth**: Protected (role: officer)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "activities": [
        {
          "action": "string",
          "applicationId": "string",
          "timestamp": "date"
        }
      ]
    }
  }
  ```

---

## 7. News Routes

**Base Path**: `/api/v1/officer/news`

### GET `/latest`

Get latest news articles (public).

- **Auth**: Public
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "news": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "headerImageUrl": "string",
          "createdAt": "date"
        }
      ]
    }
  }
  ```

### POST `/`

Create a new news article.

- **Auth**: Protected (role: officer, permission: writeNews)
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "headerImageUrl": "string"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "News created successfully",
    "data": { "news": {...} }
  }
  ```

### POST `/upload-url`

Request a signed upload URL for news images (Supabase).

- **Auth**: Protected (role: officer, permission: writeNews)
- **Request Body**:
  ```json
  {
    "fileName": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "string",
      "token": "string",
      "publicUrl": "string"
    }
  }
  ```

### PATCH `/:id`

Update an existing news article.

- **Auth**: Protected (role: officer, permission: writeNews)
- **Params**: `id` - News ID
- **Request Body**: Partial news data
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "News updated successfully"
  }
  ```

### DELETE `/:id`

Delete a news article.

- **Auth**: Protected (role: officer, permission: writeNews)
- **Params**: `id` - News ID
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "News deleted successfully"
  }
  ```

---

## 8. Chat/Conversation Routes

**Base Path**: `/api/v1/chats`

### POST `/`

Create a new support conversation (authenticated or guest).

- **Auth**: Optional (can be guest or authenticated user)
- **Request Body**:
  ```json
  {
    "subject": "string",
    "message": "string",
    "guestName": "string (if not authenticated)",
    "guestEmail": "string (if not authenticated)"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Conversation created successfully",
    "data": { "conversationId": "string" }
  }
  ```

### GET `/my-conversations`

Get all conversations for the authenticated citizen.

- **Auth**: Protected (role: citizen)
- **Query Params**: `page` (default: 1), `limit` (default: 10)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "conversations": [...],
      "pagination": { "page": 1, "limit": 10, "total": 0 }
    }
  }
  ```

### GET `/`

Get all conversations assigned to the authenticated officer.

- **Auth**: Protected (role: officer)
- **Query Params**: `page` (default: 1), `limit` (default: 10)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "conversations": [...],
      "pagination": { "page": 1, "limit": 10, "total": 0 }
    }
  }
  ```

### GET `/:conversationId`

Get messages in a specific conversation.

- **Auth**: Protected (role: officer or citizen)
- **Middleware**: `checkConversationAccess`
- **Params**: `conversationId` - Conversation ID
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "string",
        "subject": "string",
        "messages": [...]
      }
    }
  }
  ```

### POST `/:conversationId`

Post a message to a conversation (officer response).

- **Auth**: Protected (role: officer)
- **Middleware**: `checkConversationAccess`
- **Params**: `conversationId` - Conversation ID
- **Request Body**:
  ```json
  {
    "messageContent": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Message sent successfully"
  }
  ```

### PATCH `/:conversationId/read`

Mark conversation as read (officer).

- **Auth**: Protected (role: officer)
- **Middleware**: `checkConversationAccess`
- **Params**: `conversationId` - Conversation ID
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Conversation marked as read"
  }
  ```

---

## 9. Payment Routes

**Base Path**: `/api/v1/payments`

### POST `/pay`

Initialize a payment (Chapa integration).

- **Auth**: Protected (role: citizen)
- **Request Body**:
  ```json
  {
    "applicationId": "string",
    "serviceType": "string",
    "phoneNumber": "string",
    "amount": 0
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "checkoutUrl": "string",
      "txRef": "string"
    }
  }
  ```

### GET `/verify/:txRef`

Verify payment status with Chapa.

- **Auth**: Protected (any authenticated user)
- **Params**: `txRef` - Transaction reference
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "status": "success | failed",
      "payment": {...}
    }
  }
  ```

### GET `/:id/status`

Get payment status.

- **Auth**: Protected (any authenticated user)
- **Params**: `id` - Payment document ID
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "status": "pending | success | failed"
    }
  }
  ```

### GET `/history`

Get payment history for the current user.

- **Auth**: Protected (role: citizen or admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "payments": [...]
    }
  }
  ```

### GET `/:id/receipt`

Download PDF receipt for successful payment.

- **Auth**: Protected (role: citizen or admin)
- **Params**: `id` - Payment document ID
- **Response** (200): PDF file stream
- **Content-Type**: `application/pdf`

---

## 10. Notification Routes

**Base Path**: `/api/v1/notifications`

All notification routes require authentication.

### GET `/`

Get user notifications (paginated).

- **Auth**: Protected (any authenticated user)
- **Query Params**: 
  - `page` (default: 1)
  - `limit` (default: 5)
  - `unreadOnly` (optional: "true")
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "notifications": [...],
      "pagination": { "page": 1, "limit": 5, "total": 0 }
    }
  }
  ```

### PATCH `/:id/mark-read`

Mark a notification as read.

- **Auth**: Protected (any authenticated user)
- **Params**: `id` - Notification ID
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Notification marked as read"
  }
  ```

### PATCH `/mark-all-read`

Mark all notifications as read.

- **Auth**: Protected (any authenticated user)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "All notifications marked as read",
    "data": { "modifiedCount": 0 }
  }
  ```

### DELETE `/:id`

Delete a notification (soft delete).

- **Auth**: Protected (any authenticated user)
- **Params**: `id` - Notification ID
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully"
  }
  ```

---

## 11. Admin Routes

**Base Path**: `/api/v1/admin`

All admin routes (except `/create`) require authentication and admin role.

### POST `/create`

Create the initial admin account (one-time setup).

- **Auth**: Public (should be disabled after first use)
- **Request Body**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Admin created successfully"
  }
  ```

### GET `/user`

Search for users (citizens).

- **Auth**: Protected (role: admin)
- **Query Params**: `name` (optional), `email` (optional)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "users": [...]
    }
  }
  ```

### POST `/officers/assign`

Assign a citizen to officer role.

- **Auth**: Protected (role: admin)
- **Request Body**:
  ```json
  {
    "userId": "string",
    "department": "approver | customer_support",
    "subcity": "string",
    "adminPassword": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Officer assigned successfully",
    "data": { "officer": {...} }
  }
  ```

### GET `/metrics/performance`

Get system performance metrics.

- **Auth**: Protected (role: admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "totalApplications": 0,
      "approvalRate": 0,
      "avgProcessingTime": 0,
      ...
    }
  }
  ```

### GET `/metrics/officers`

Get officer performance data.

- **Auth**: Protected (role: admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "officers": [
        {
          "id": "string",
          "name": "string",
          "department": "string",
          "metrics": {...}
        }
      ]
    }
  }
  ```

### GET `/metrics/performance/download`

Export performance report as file.

- **Auth**: Protected (role: admin)
- **Response** (200): File stream (CSV/Excel)
- **Content-Type**: `application/octet-stream`

---

## 12. Health & Metrics Routes

### GET `/api/v1/health`

Health check endpoint.

- **Auth**: Public
- **Response** (200):
  ```json
  {
    "status": "ok",
    "timestamp": "date"
  }
  ```

### GET `/api/v1/admin/security/metrics`

Get security metrics (login attempts, etc.).

- **Auth**: Protected (role: admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "loginAttempts": 0,
      "failedLogins": 0,
      ...
    }
  }
  ```

---

## Standard Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "message": "Detailed error message",
    "code": "ERROR_CODE (optional)"
  }
}
```

### Common HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## CORS Configuration

The backend is configured to accept requests from the frontend origin with credentials:

- **Allowed Origin**: Frontend URL (configured via environment)
- **Credentials**: `true` (allows cookies)
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE
- **Allowed Headers**: Content-Type, Authorization (for backward compatibility)
