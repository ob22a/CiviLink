### **1. List Assigned Applications**  
`GET /api/v1/officer/applications`  
![GET](https://img.shields.io/badge/GET-2196F3?style=flat&labelColor=000)

**Auth:** officer (department = approval)  
**Purpose:** Get assigned applications (TIN & Vital).  
**Query Parameters:**  
- `status=pending`  
- `limit=25`

---

### **2. Get Application Details**  - Added incase Application(TIN/Vital) API is not sufficient
`GET /api/v1/officer/applications/:id`  
![GET](https://img.shields.io/badge/GET-2196F3?style=flat&labelColor=000)

**Auth:** assigned officer only  
**Response:** Full application data

---

### **3. Create Weekly News**  
`POST /api/v1/officer/news`  
![POST](https://img.shields.io/badge/POST-4CAF50?style=flat&labelColor=000)

**Auth:** officer (department = news for this week)  
**Purpose:** Create a weekly news post

#### Request Body
```json
{
  "title": "...",
  "content": "...",
  "headerImageUrl": "..."
}
````

#### Response

```json
{
    "success": true,
    "data": {
        "newsId": "69542c59c69d7abded07e5e1"
    },
    "error": null
}
```

---

### **4. Edit News**

`PATCH /api/v1/officer/news/:id`
![PATCH](https://img.shields.io/badge/PATCH-FFC107?style=flat\&labelColor=000)

**Auth:** authoring officer + currently assigned
**Purpose:** Edit own news while assignment is active

```json
{
    "success": true,
    "data": {
        "_id": "69542c59c69d7abded07e5e1",
        "title": "Corruption",
        "content": "Corruption has been reduced by 100%",
        "author": "695428711cecac7b52621ba0",
        "headerImageUrl": null,
        "createdAt": "2025-12-30T19:47:37.562Z"
    },
    "error": null
}
```

---

### **5. Delete News**

`DELETE /api/v1/officer/news/:id`
![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat\&labelColor=000)

**Auth:** authoring officer only (within assignment window)
**Purpose:** Remove news post

```json
{
    "success": true,
    "data": {
        "message": "News deleted successfully"
    }
}
```

---

### **6. Get Latest News**  
`GET /api/v1/officer/news/latest`  
![GET](https://img.shields.io/badge/GET-2196F3?style=flat&labelColor=000)

**Auth:** optional (signed-in by default)  
**Purpose:** Retrieve the latest news posts.

#### Response
- Returns the **latest 5 non-archived news** items
```
{
    "success": true,
    "data": [
        {
            "_id": "69550746a5a777f387f8569a",
            "title": "CSS HOOKS",
            "content": "hooksss yeah",
            "author": {
                "_id": "695428711cecac7b52621ba0",
                "fullName": "Grady Rippin MD"
            },
            "headerImageUrl": "test_1767180074694.png",
            "createdAt": "2025-12-31T11:21:42.682Z",
            "fullImageUrl": "https://gqbbatvjgkyvvvbkvthh.supabase.co/storage/v1/object/public/News/test_1767180074694.png",
            "id": "69550746a5a777f387f8569a"
        }, ...
    ],
    "error": null
}
```
