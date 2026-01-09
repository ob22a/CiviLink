### **1. List Notifications**  
`GET /api/v1/notifications`  
![GET](https://img.shields.io/badge/GET-2196F3?style=flat&labelColor=000)

**Auth:** citizen | officer  
**Query Parameters:**  
- `page`  
- `limit`  
- `unreadOnly=true` (optional)

**Response:**  
List of notifications ordered by `createdAt`.

```json
    {
    "success": true,
    "data": {
        "notifications": [
            {
                "title": "New Login",
                "message": "New login detected on Dec 30, 07:23 PM. If this wasn't you, please change your password.",
                "read": true,
                "createdAt": "2025-12-30T16:23:53.213Z",
                "id": "6953fc99c792b874e01811b5"
            },...
        ],
        "total": 2,
        "page": 2,
        "totalPages": 2,
        "hasPrevPage": true,
        "hasNextPage": false
    }
}
```

---

### **2. Mark a Notification as Read**  
`PATCH /api/v1/notifications/:id/mark-read`  
![PATCH](https://img.shields.io/badge/PATCH-FFC107?style=flat&labelColor=000)

**Auth:** owner  
**Response:** `200 OK`

```json
{
    "success": true,
    "data": {
        "_id": "6953fc99c792b874e01811b5",
        "title": "New Login",
        "message": "New login detected on Dec 30, 07:23 PM. If this wasn't you, please change your password.",
        "read": true,
        "createdAt": "2025-12-30T16:23:53.213Z"
    }
}
```

---

### **3. Mark All Notifications as Read**  
`PATCH /api/v1/notifications/mark-all-read`  
![PATCH](https://img.shields.io/badge/PATCH-FFC107?style=flat&labelColor=000)

**Auth:** owner
**Response:** `200 OK`

```json
    {
    "success": true,
    "data": {
        "_id": "6953fc99c792b874e01811b5",
        "title": "New Login",
        "message": "New login detected on Dec 30, 07:23 PM. If this wasn't you, please change your password.",
        "read": true,
        "createdAt": "2025-12-30T16:23:53.213Z"
    }
}
```

---

### **4. Delete Notification**  
`DELETE /api/v1/notifications/:id`  
![DELETE](https://img.shields.io/badge/DELETE-F44336?style=flat&labelColor=000)

**Auth:** owner  
**Behavior:** Delete the notification.
**Response:** `200 OK`

---

```json
{
    "success": true,
    "data": {
        "id": "6953fc99c792b874e01811b5",
        "message": "Notification deleted."
    }
}
```

---