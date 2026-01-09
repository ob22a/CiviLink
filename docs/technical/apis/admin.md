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

### **5. Get Aggregated Performance Metrics**

`GET /api/v1/admin/metrics/performance`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Retrieve aggregated officer performance metrics.

#### Query Parameters

`?from=YYYY-MM-DD&to=YYYY-MM-DD&officerId=&department=&subcity=`

#### Response

```json
"summary": {
        "totalRequestsProcessed": 1842,
        "averageResponseTimeMs": 6599218784.760313,
        "communicationResponseRate": 0.39875883193761885
    },
    "topPerformers": [
        {
            "officerId": "694d430593be4e561446bdaa",
            "fullName": "Roberta Donnelly",
            "email": "tre80@yahoo.com",
            "department": "approver",
            "totalApplications": 132,
            "totalConversations": 0,
            "avgResponseTimeMs": 6197845844.030983,
            "requestsProcessed": 128,
            "applicationResponseRate": 0.9696969696969697,
            "communicationResponseRate": 0,
            "rankScore": 4.742156730396852,
            "normalizedScore": 100,
        }, ...
    ],
  "worstPerformers": [
        {
            "_id": "694d430593be4e561446bdaa",
            "fullName": "Roberta Donnelly",
            "email": "tre80@yahoo.com",
            "onLeave": false,
            "department": "approver",
            "totalApplications": 132,
            "totalConversations": 0,
            "avgResponseTimeMs": 6197845844.030983,
            "requestsProcessed": 128,
            "applicationResponseRate": 0.9696969696969697,
            "communicationResponseRate": 0,
            "rankScore": 4.742156730396852,
            "normalizedScore": 100,
        }, ...
    ],
  "monthlyTrend": [
        {
            "averageResponseTimeMs": 800401376.6458334,
            "communicationResponseRate": 0.6666666666666666,
            "applicationResponseRate": 0.9090909090909091,
            "month": "2025-01",
            "requestsProcessed": 14
        } ...
    ]

```

---

### **6. Get Officer Performance Metrics**

`GET api/v1/admin/metrics/officers`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Retrieve officer performance metrics.

#### Query Parameters

`?from=2025-02-01&to=2025-05-01&department=approver&subcity=Nefas Silk Lafto&page=2&limit=5`

#### Response

```json
  "docs": [
            {
                "officerId": "694d430593be4e561446bdd9",
                "name": "Jennifer Runte",
                "department": "approver",
                "subcity": "Nefas Silk Lafto",
                "requestsTotal": 9,
                "requestsProcessed": 9,
                "avgResponseTime": 6482214441.555554,
                "responseRate": 100,
                "rawScore": 2.302585092994046,
                "rankScore": 2.302585092994046,
                "score": 83.04820237218406
            }, ...
        ],
  "totalDocs": 7,
  "limit": 5,
  "page": 2,
  "totalPages": 2,
  "pagingCounter": 6,
  "hasPrevPage": true,
  "hasNextPage": false,
  "prevPage": 1,
  "nextPage": null,
```


### **7. Download Officer Performance Metrics**

`GET /api/v1/admin/metrics/performance/download`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Download aggregated performance report.

#### Query Parameters

`?from=YYYY-MM-DD&to=YYYY-MM-DD&officerId=&department=&subcity=`

#### Response

* Link to download detailed Excel sheet

---

### **8. Get Security Logs**

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

### **9. Export Security Logs**

`POST /api/v1/admin/metrics/security/export`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** admin
**Purpose:** Export filtered security logs.

#### Query Parameters

`?from=&to=&attemptCountMin=&failedOnly=true&afterHoursOnly=true&officerName=`

#### Response

* Download link for security report