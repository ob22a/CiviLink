### **1. Submit Vital Registration Application (Birth | Marriage | Death)**  
`POST /api/v1/vital/:type/applications`  
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat&labelColor=000)

**type:** `birth | marriage | death`  
**Auth:** citizen  
**Purpose:** Submit a new vital event registration.

#### Request Body
```json
{
  "formData": { 
    "marriage":{
      "husband": {
        "applicantInformation": {
          "fullName": "",
          "dateOfBirth": "",
          "placeOfBirth": "",
          "nationality": "",
          "address": "",
          "phoneNumber": "",
          "emailAddress": ""
        },
        "witnessInformation": [
          {
            "fullName": "",
            "relationship": "",
            "contactNumber": "",
            "address": ""
          }
        ]
      },
    
      "wife": {
        "applicantInformation": {
          "fullName": "",
          "dateOfBirth": "",
          "placeOfBirth": "",
          "nationality": "",
          "address": "",
          "phoneNumber": "",
          "emailAddress": ""
        },
        "witnessInformation": [
          {
            "fullName": "",
            "relationship": "",
            "contactNumber": "",
            "address": ""
          }
        ]
      },
    
      "ceremonyDetails": {
        "date": "",
        "time": "",
        "place": "",
        "officiant": ""
      }
    },

    "birth":{
      "child": {
        "firstName": "",
        "middleName": "", //optional
        "lastName": "",
        "gender": "",
        "date": "",
        "time": "", //optional
        "place": ""
      },
    
      "mother": {
        "firstName": "",
        "lastName": "",
        "date": "",
        "nationality": "",
        "occupation": "" //optional
      },
    
      "father": {
        "firstName": "",
        "lastName": "",
        "date": "",
        "nationality": "",
        "occupation": "" //optional
      },
    
      "medicalFacility": {
        "facilityName": "",
        "attendingPhysician": "", //optional
        "address": ""
      }
    },
    "subcity":"Bole",
  }
}
````

#### Validations

* Must have both **Kebele ID** and **Fayda ID** uploaded
* No duplicate active application allowed

#### Response — 201 Created

```json
{
  "applicationId": "..."
}
```

---

### **2. List Vital Applications (Citizen)**

`GET /api/v1/vital/applications`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** citizen
**Response:** List of all **active** and **completed** vital registrations.

---

### **3. Get Vital Application Details**

`GET /api/v1/vital/:type/applications/:id`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** owner or assigned officer
**Response:**

* Application details
* Status
* Payment ID
* Full form data
* Schedule card download link (if generated)

---

### **4. Approve Vital Application**

`POST /api/v1/vital/:type/applications/:id/approve`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** assigned officer
**Behavior:**

* Approve application
* Auto-assign appointment (system-generated)
* Generate `scheduleCardUrl`
* Set status to **approved**

---

### **5. Reject Vital Application**

`POST /api/v1/vital/:type/applications/:id/reject`
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat\&labelColor=000)

**Auth:** assigned officer
**Request Body**

```json
{
  "reason": "..."
}
```

#### Response

* Status set to **rejected**
* Notification sent with reason

---

### **6. Withdraw Vital Application**

`DELETE /api/v1/vital/:type/applications/:id`
![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat\&labelColor=000)

**Auth:** owner
**Condition:** Only allowed **before review**.

---

### **7. Download Approved Vital Certificate / Schedule Card**

`GET /api/v1/vital/:type/applications/:id/download`
![GET](https://img.shields.io/badge/GET-2196F3?style=flat\&labelColor=000)

**Auth:** owner
**Condition:** Application must be **approved**.
