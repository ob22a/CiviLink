### **1. Submit a New TIN Application (Citizen)**  
`POST /api/v1/tin/applications`  
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat&labelColor=000)

**Auth:** citizen  
**Purpose:** Submit a new TIN application.

#### Request Body
```json
{
  "formData": {
    "personal":{
        "firstName": "John",
        "middleName": "Micheal", //Optional
        "lastName": "Doe",
        "dateOfBirth": "05/15/1990",
        "gender": "Male/Female",
        "bankAccountNumber": "1234567890",
        "FAN": "12345678",
        "email": "johnMicheal@email.com"
    },
    "employmentDetails":{
        "occupation": "Software Engineer",
        "employerName": "Acme Corp", //Optional
        "employerAddress":"Addis Ababa" //Optional
    },
    "addressDetails":{
        "streetAddress": "Bole road, Meskel Square",
        "city": "Addis Ababa",
        "region": "Addis Ababa",
        "postalCode": 1000 //Optional
    },
    "subcity":"Bole",
  }
}
````

#### Validations

* Both **Fayda** and **Kebele** ID must be provided
* Prevent duplicate active applications → return **409 Conflict**

#### Response — 201 Created

```json
{
  "applicationId": "..."
}
```

---

### **2. Get TIN Application by ID**

`GET /api/v1/tin/applications/:id`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:**

* Owner user **OR**
* Assigned officer

**Response:**
Full application document including:

* Mandatory formData
* Status
* paymentId

---

### **3. Withdraw TIN Application**

`DELETE /api/v1/tin/applications/:id`
![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat\&labelColor=000)

**Auth:** owner only
**Purpose:** Withdraw application before review.

#### Validation

* Only allowed when **status = pending**

---

### **4. Approve TIN Application**

`POST /api/v1/tin/applications/:id/approve`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** assigned officer
**Purpose:** Approve application and generate TIN certificate.

#### Optional Body

```json
{
  "notes": "..."
}
```

#### Response

* Status updated to **approved**
* `tinCertificateUrl` created
* Notification triggered

#### RBAC Rules

* Must be **assigned officer**
* Officer must have **role = approval**
* Officer's **subcity** must match

---

### **5. Reject TIN Application**

`POST /api/v1/tin/applications/:id/reject`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** assigned officer
**Purpose:** Reject an application.

#### Request Body

```json
{
  "reason": "Incorrect DOB or missing documents"
}
```

#### Response

* Status updated to **rejected**
* Notification sent with rejection reason

---

### **6. Download TIN Certificate**

`GET /api/v1/tin/applications/:id/certificate`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** owner only
**Purpose:** Download TIN certificate using a presigned URL or streamed proxy response.
