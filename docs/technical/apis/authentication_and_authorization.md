# Authentication & User API Documentation

---

## Authentication

---

### **1. Register User (Citizen)**  
`POST /api/v1/auth/register`  
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat&labelColor=000)

**Auth:** Public  
**Purpose:** Create a new citizen account.

#### Request Body
```json
{
  "fullName": "string",
  "email": "email",
  "password": "string",
  "confirmPassword": "string",
  "acceptTerms": true
}
````

#### Validations

* Email must be **unique**
* Password must include:

  * Minimum **8 characters**
  * Uppercase, lowercase, number, special character
* `confirmPassword` must match password

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "fullName": "...",
      "email": "...",
      "role": "citizen"
    },
    "message": "Registration successful"
  }
}
```

**Cookies:** Access Token + Refresh Token stored in **HTTPOnly cookies**

---

### **2. Login**

`POST /api/v1/auth/login`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** Public
**Purpose:** Authenticate using email/password.

#### Request Body

```json
{
  "email": "...",
  "password": "...",
  "rememberMe": true
}
```

#### Response — 200 OK

If `rememberMe = true`:

* Stores **Access Token** + **Refresh Token** (HTTPOnly cookies)

If `rememberMe = false`:

* Stores **Access Token only**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "role": "citizen",
      "profileCompletePct": ""
    }
  }
}
```

---

### **3. Logout**

`POST /api/v1/auth/logout`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** Required
**Purpose:** Revoke refresh token and clear cookies.

#### Response — 200 OK

* Clears Access Token and Refresh Token cookies

---

### **4. Refresh Access Token**

`POST /api/v1/auth/refresh`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** Public (cookie-based)
**Purpose:** Generate a new access token using a valid refresh token.

#### Response

* New Access Token stored in **HTTPOnly cookie**

---

### **5. Google OAuth Login Redirect**

`GET /api/v1/auth/google-login`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** Public
**Purpose:** Initiate Google OAuth sign-in.

---

### **6. Google OAuth Callback**

`GET /api/v1/auth/google-callback`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** Public
**Purpose:** Finalize Google OAuth login, create account if needed, and issue tokens.

---

## Authorization

Access token stores the **User ID**, which is used to query the database for the full profile.

---

### **7. Get User Profile**

`GET /api/v1/user/profile`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** citizen | officer | admin
**Purpose:** Fetch authenticated user profile.

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "...",
    "email": "...",
    "role": "citizen | officer | admin",
    "sub-city":"",
  }
}
```

---

### **8. Change Password**

`PATCH /api/v1/user/change-password`
![PATCH](https://img.shields.io/badge/PATCH-FFC107?style=flat\&labelColor=000)

**Auth:** Required
**Purpose:** Update password.

#### Request Body

```json
{
  "currentPassword": "",
  "newPassword": "",
  "confirmPassword": ""
}
```

---

### **9. Delete User ID Information**

`DELETE /api/v1/user/id/:idType`
![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat\&labelColor=000)

**Auth:** User only
**Purpose:** Delete both Fayda and Kebele ID info.
**Route Param**: idType='fayda'|'kebele'|'both'
Also purges:

* `id_verifications` document
* `extractedData`

#### Response — 200 OK

Includes audit timestamp.

---

