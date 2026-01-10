# **CiviLink – Government Service Application**

*A platform for citizens, officers, and administrators to manage national services efficiently.*

🔗 **Live Deployment:** [https://civilink.onrender.com/](https://civilink.onrender.com/)
<br/>
📧 **Additional Contact:** [ob22adegefu123@gmail.com](mailto:ob22adegefu123@gmail.com)

---

## 📌 **Overview**

CiviLink is a role-based government service automation system that allows:

### 👤 Citizens

* Apply for **TIN** (Tax Identification Number)
* Apply for **Vital Registration**
* Track application status
* Submit questions & queries to officers

### 🧑‍💼 Officers

* Receive and process applications
* Approve or reject requests
* Respond to citizen queries
* Publish weekly announcements (if assigned)

### 👨‍⚖️ Admins

* Manage officer accounts
* Assign and remove roles
* View system metrics
* Monitor system activity

---

## 🏗 **Project Architecture**

The system follows a **modular full-stack architecture**:

```
CiviLink/
│
├── client/        # React frontend
├── server/        # Node.js backend
├── docs/          # All documentation
└── .github/       # GitHub automation (CI, PR templates)
                   # CI is partially non-functional due to
                   # MongoDB & environment variable limitations
```

🟦 **Frontend:** React (JavaScript, no TypeScript) <br/>
🟩 **Backend:** Node.js (JavaScript, Express.js) <br/>
🗄 **Database:** MongoDB <br/>
🧪 **Testing:** Jest, Supertest <br/>
🚀 **Deployment:** Render

---

## 🔧 **Tech Stack**

| Layer           | Technologies                   |
| --------------- | ------------------------------ |
| Frontend        | React, React Router            |
| Backend         | Node.js, Express.js            |
| Database        | MongoDB                        |
| Validation      | Joi                            |
| Auth            | JWT-based RBAC                 |
| Testing         | Jest, Supertest                |
| Deployment      | Render                         |
| Version Control | Git + GitHub (dev → main flow) |

---

## 👥 **User Roles & Test Accounts**

### 🔹 Admin

* **Email:** [superadmin@civillink.com](mailto:superadmin@civillink.com)
* **Password:** TheAdmin1@

---

### 🔹 News Officer

* **Email:** [annabelle.sporer99@hotmail.com](mailto:annabelle.sporer99@hotmail.com)

⚠️ **Note:**
News content is seeded using **FakerJS**, which is why the text may appear random or meaningless.

---

### 🔹 Approver Officer

* **Email:** [fekeAsche@yahoo.com](mailto:fekeAsche@yahoo.com)

### 🔹 Customer Support Officer

* **Email:** [SemeK@gmail.com](mailto:SemeK@gmail.com)
---

## 🧪 **Additional Seeded Test Accounts**

Because the application uses **seeded data**, some backend actions (approval, rejection, or responses) may fail if the data was not part of the original seed.

Additional seeded officers:

### Approver Officer

* [rylan42@hotmail.com](mailto:rylan42@hotmail.com)

### Customer Support Officer

* [orrin.cole@hotmail.com](mailto:orrin.cole@hotmail.com)

⚠️ This behavior is **intentional** and part of backend validation logic.

**Password for all officers is:** Password123!

---

## 💳 **Payments (Chappa – Test Mode)**

The application integrates **Chappa** for payments.

⚠️ **Important for Testing:**

* When redirected to Chappa’s payment page, **DO NOT use your personal phone number or password**
* Select **one of Chappa’s official test phone numbers**
* Complete the payment using **test credentials only**

This is required because the integration runs in **sandbox/test mode**.

---

# 🚀 **Getting Started**

## 1️⃣ Clone the Repository

```sh
git clone https://github.com/ob22a/CiviLink
cd CiviLink
```

---

## 2️⃣ Install Dependencies

### Client

```sh
cd client
npm install
```

### Server

```sh
cd server
npm install
```

---

# 🔐 **Environment Variables**

### Frontend (`/client/.env.example`)

### Backend (`/server/.env.example`)

Copy each `.env.example` file and rename it to `.env` and fill it with the appropriate values.

---

# ▶️ **Run Locally**

### Start Backend

```sh
cd server
npm run dev
```

### Start Frontend

```sh
cd client
npm run dev
```

---

# 🧪 **Testing**

### Backend Tests (Jest + Supertest)

```sh
cd server
npm test
```

✔ Every pull request should include tests **where applicable**.

---

# 🌀 **Git Workflow (Important)**

* All development is done on the `dev` branch

### Branch naming

```
feature/<name>
bugfix/<name>
hotfix/<name>
```

### Merging Rules

* PRs target `dev`
* `dev → main` only during releases
* No self-merging allowed

---

# 📄 **Documentation**

All documentation is located in:

```
/docs/
```

Includes:

* Product requirements
* API documentation
* Architecture documentation

Not currently available:

* Roadmaps
* Risk analysis
* Scrum artifacts
* Manuals for officers and Admins

---

# 🔒 **Security**

The system enforces:

* JWT authentication
* Role-Based Access Control (RBAC)
* Input validation on all endpoints
* Request logging
* No sensitive data in logs
* HTTPS enforced by Render

To report a security issue, create a **GitHub Security Issue** or contact the project owner.

---

# 👥 **Contributing**

See:

```
/CONTRIBUTING.md
```

Includes:

* Branch rules
* Commit style
* PR requirements
* Testing expectations
* Reviewer responsibilities

---

# 🎉 **Contributors**

<a href="https://github.com/ob22a/CiviLink/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ob22a/CiviLink" />
</a>
