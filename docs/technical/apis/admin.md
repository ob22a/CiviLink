### **1. Search / Filter Officers**  
`GET /api/v1/admin/officers`  
![GET](https://img.shields.io/badge/GET-2196F3?style=flat&labelColor=000)

**Auth:** admin  
**Purpose:** Search and filter officers.

#### Query Parameters
`?name=&email=&department=&subcity=&status=&page=&limit=`

#### Response
- Paginated officers list with workload statistics

---

### **2. Search User**
`GET /api/v1/admin/user`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat&labelColor=000)

**Auth:** admin
**Purpose:** Search user.

#### Query Parameters
`?name=|email=`

#### Response
- 5 users matching the query parameters 

### **3. Assign User as Officer**  
`POST /api/v1/admin/officers/assign`  
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat&labelColor=000)

**Auth:** admin  
**Purpose:** Convert a user to officer and assign department/subcity.

#### Request Body
```json
{
  "userId": "",
  "department": "approval | support | news",
  "subcity": "Bole"
}
````

**Security:**

* Frontend: require admin password re-entry via modal
* Backend: require `adminConfirmation: true` + `adminId` or signed header indicating re-authentication

---

### **4. Update Officer Metadata**

`PUT /api/v1/admin/officers/:id`
![PUT](https://img.shields.io/badge/PUT-FFC107?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Update officer metadata (status, subcity, onLeave)

---

### **5. Get Officer Performance Metrics**

`GET /api/v1/admin/metrics/performance`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Retrieve aggregated officer performance metrics.

#### Query Parameters

`?from=YYYY-MM-DD&to=YYYY-MM-DD&officerId=&department=&subcity=&page=&limit=`

#### Response

```json
{
  "totalRequestsProcessed": 0,
  "averageResponseTimeMs": 0,
  "communicationResponseRate": 0,
  "topPerformers": [],
  "worstPerformers": [],
  "monthlyTrend": [
    {
      "month": "2025-10",
      "requestProcessed": 21,
      "averageResponseTimeMs": 200,
      "communicationResponseRate": 200
    }
  ]
}
```

---

### **6. Download Officer Performance Metrics**

`GET /api/v1/admin/metrics/performance/download`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Download aggregated performance report.

#### Query Parameters

`?from=YYYY-MM-DD&to=YYYY-MM-DD&officerId=&department=&subcity=`

#### Response

* Link to download detailed Excel sheet

---

### **7. Get Security Logs**

`GET /api/v1/admin/metrics/security`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Retrieve filtered security logs.

#### Query Parameters

`?from=&to=&attemptCountMin=&failedOnly=true&afterHoursOnly=true&officerName=&page=&limit=`

#### Response

* JSON array of security log entries
```json
{
  "reports": [
    {
      "timeOfAttempt": ,
      "attemptType": ,
      "count": ,
      "officerName": 
    }, 
  ]
}
```

---

### **8. Export Security Logs**

`POST /api/v1/admin/metrics/security/export`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Export filtered security logs.

#### Query Parameters

`?from=&to=&attemptCountMin=&failedOnly=true&afterHoursOnly=true&officerName=`

#### Response

* Download link for security report
