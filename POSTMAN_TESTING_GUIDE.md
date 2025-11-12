# Restaurant Reservation System - Postman Testing Guide

## Base URL
```
http://localhost:5000/api/v1
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register a New User
**Endpoint:** `POST /auth/register`  
**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Customer",
  "email": "customer@test.com",
  "password": "password123",
  "role": "Customer"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "name": "John Customer",
    "email": "customer@test.com",
    "role": "Customer",
    "_id": "..."
  }
}
```

### 1.2 Register Admin User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "Admin"
}
```

### 1.3 Register Manager User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Manager User",
  "email": "manager@test.com",
  "password": "manager123",
  "role": "Manager"
}
```

### 1.4 Login
**Endpoint:** `POST /auth/login`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "customer@test.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Logged in successfully"
}
```

**Note:** JWT token is stored in httpOnly cookie automatically.

### 1.5 Logout
**Endpoint:** `POST /auth/logout`  
**Auth Required:** Yes

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. TABLE MANAGEMENT ENDPOINTS

### 2.1 Create Table (Admin/Manager Only)
**Endpoint:** `POST /tables`  
**Auth Required:** Yes (Admin or Manager)

**Request Body:**
```json
{
  "tableNumber": "T-001",
  "capacity": 4,
  "location": "Indoor",
  "features": ["Window View", "Quiet Area"]
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Table created successfully",
  "table": {
    "_id": "...",
    "tableNumber": "T-001",
    "capacity": 4,
    "location": "Indoor",
    "status": "Available",
    "features": ["Window View", "Quiet Area"],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Create Multiple Tables for Testing:**
```json
// Table 2
{
  "tableNumber": "T-002",
  "capacity": 2,
  "location": "Indoor"
}

// Table 3
{
  "tableNumber": "T-003",
  "capacity": 6,
  "location": "Outdoor",
  "features": ["Window View"]
}

// Table 4
{
  "tableNumber": "T-004",
  "capacity": 8,
  "location": "Private Room",
  "features": ["Wheelchair Accessible", "Quiet Area"]
}
```

### 2.2 Get All Tables
**Endpoint:** `GET /tables`  
**Auth Required:** Yes

**Expected Response (200):**
```json
{
  "status": "success",
  "count": 4,
  "tables": [...]
}
```

### 2.3 Get Table by ID
**Endpoint:** `GET /tables/:id`  
**Auth Required:** Yes

**Example:** `GET /tables/673356a1b2c3d4e5f6789012`

### 2.4 Update Table (Admin/Manager Only)
**Endpoint:** `PUT /tables/:id`  
**Auth Required:** Yes (Admin or Manager)

**Request Body:**
```json
{
  "capacity": 5,
  "status": "Available",
  "location": "Patio"
}
```

### 2.5 Delete Table (Admin Only)
**Endpoint:** `DELETE /tables/:id`  
**Auth Required:** Yes (Admin only)

---

## 3. RESERVATION ENDPOINTS

### 3.1 Check Available Tables
**Endpoint:** `GET /reservations/available-tables`  
**Auth Required:** Yes

**Query Parameters:**
- `partySize` (required): Number of people
- `reservationDate` (required): Date in YYYY-MM-DD format
- `startTime` (required): Time in HH:MM format (24-hour)
- `endTime` (required): Time in HH:MM format (24-hour)

**Example Request:**
```
GET /reservations/available-tables?partySize=4&reservationDate=2025-11-15&startTime=18:00&endTime=20:00
```

**Expected Response (200):**
```json
{
  "status": "success",
  "count": 3,
  "tables": [
    {
      "_id": "...",
      "tableNumber": "T-001",
      "capacity": 4,
      "location": "Indoor",
      "status": "Available",
      "features": ["Window View", "Quiet Area"]
    }
  ]
}
```

### 3.2 Create Reservation (Customer)
**Endpoint:** `POST /reservations`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "tableId": "673356a1b2c3d4e5f6789012",
  "partySize": 4,
  "reservationDate": "2025-11-15",
  "startTime": "18:00",
  "endTime": "20:00",
  "customerName": "John Customer",
  "customerEmail": "customer@test.com",
  "customerPhone": "+1234567890",
  "specialRequests": "Window seat if possible",
  "occasion": "Birthday"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Reservation created successfully",
  "reservation": {
    "_id": "...",
    "userId": {...},
    "tableId": {...},
    "partySize": 4,
    "reservationDate": "2025-11-15T00:00:00.000Z",
    "startTime": "18:00",
    "endTime": "20:00",
    "duration": 2,
    "status": "Pending",
    "customerName": "John Customer",
    "customerEmail": "customer@test.com",
    "customerPhone": "+1234567890",
    "specialRequests": "Window seat if possible",
    "occasion": "Birthday",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 3.3 Get My Reservations (Customer)
**Endpoint:** `GET /reservations/my-reservations`  
**Auth Required:** Yes

**Expected Response (200):**
```json
{
  "status": "success",
  "count": 2,
  "reservations": [...]
}
```

### 3.4 Get All Reservations (Admin/Manager Only)
**Endpoint:** `GET /reservations/all`  
**Auth Required:** Yes (Admin or Manager)

**Optional Query Parameters:**
- `status`: Filter by status (Pending, Confirmed, Cancelled, Completed, No-Show)
- `date`: Filter by date (YYYY-MM-DD)

**Example Requests:**
```
GET /reservations/all
GET /reservations/all?status=Pending
GET /reservations/all?date=2025-11-15
GET /reservations/all?status=Confirmed&date=2025-11-15
```

### 3.5 Update Reservation Status (Admin/Manager Only)
**Endpoint:** `PUT /reservations/status/:id`  
**Auth Required:** Yes (Admin or Manager)

**Request Body:**
```json
{
  "status": "Confirmed"
}
```

**Valid Status Values:**
- Pending
- Confirmed
- Cancelled
- Completed
- No-Show

### 3.6 Cancel Reservation
**Endpoint:** `PUT /reservations/cancel/:id`  
**Auth Required:** Yes

**Note:** Customers can only cancel their own reservations. Admin/Manager can cancel any reservation.

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Reservation cancelled successfully",
  "reservation": {...}
}
```

---

## 4. USER ENDPOINTS

### 4.1 Get Current User
**Endpoint:** `GET /user`  
**Auth Required:** Yes

### 4.2 Update User Profile
**Endpoint:** `PUT /user/profile`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@test.com",
  "password": "newpassword123"
}
```

### 4.3 Get User Logs (Admin Only)
**Endpoint:** `GET /user/log/:id`  
**Auth Required:** Yes (Admin)

### 4.4 Delete Account
**Endpoint:** `DELETE /user/delete/:id`  
**Auth Required:** Yes (Customer role)

---

## TESTING WORKFLOW

### Step 1: Setup (Do this first)
1. **Register Admin User**
   - POST `/auth/register` with Admin role
   
2. **Login as Admin**
   - POST `/auth/login` with admin credentials
   
3. **Create Tables**
   - POST `/tables` - Create 4-5 tables with different capacities

### Step 2: Customer Flow
1. **Register Customer**
   - POST `/auth/register` with Customer role
   
2. **Login as Customer**
   - POST `/auth/login` with customer credentials
   
3. **Check Available Tables**
   - GET `/reservations/available-tables?partySize=4&reservationDate=2025-11-15&startTime=18:00&endTime=20:00`
   
4. **Create Reservation**
   - POST `/reservations` with table from available tables
   
5. **View My Reservations**
   - GET `/reservations/my-reservations`
   
6. **Cancel Reservation** (Optional)
   - PUT `/reservations/cancel/:id`

### Step 3: Manager/Admin Flow
1. **Login as Admin/Manager**
   - POST `/auth/login` with admin/manager credentials
   
2. **View All Reservations**
   - GET `/reservations/all`
   
3. **Update Reservation Status**
   - PUT `/reservations/status/:id` - Change to "Confirmed"
   
4. **Manage Tables**
   - PUT `/tables/:id` - Update table status
   - DELETE `/tables/:id` - Delete a table (Admin only)

---

## POSTMAN SETUP TIPS

### 1. Create Environment Variables
- `baseUrl`: `http://localhost:5000/api/v1`
- `adminEmail`: `admin@test.com`
- `customerEmail`: `customer@test.com`

### 2. Enable Cookie Handling
- Postman automatically handles cookies
- Make sure "Automatically follow redirects" is enabled
- Cookies tab will show the JWT token after login

### 3. Test Collection Order
1. Auth → Register Users
2. Auth → Login
3. Tables → Create Tables (as Admin)
4. Tables → Get All Tables
5. Reservations → Check Available Tables
6. Reservations → Create Reservation
7. Reservations → Get My Reservations
8. Reservations → Update Status (as Admin)

---

## ROLE-BASED ACCESS SUMMARY

| Endpoint | Customer | Manager | Admin |
|----------|----------|---------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| View Tables | ✅ | ✅ | ✅ |
| Check Availability | ✅ | ✅ | ✅ |
| Create Reservation | ✅ | ✅ | ✅ |
| View My Reservations | ✅ | ✅ | ✅ |
| Cancel Own Reservation | ✅ | ✅ | ✅ |
| View All Reservations | ❌ | ✅ | ✅ |
| Update Reservation Status | ❌ | ✅ | ✅ |
| Create Table | ❌ | ✅ | ✅ |
| Update Table | ❌ | ✅ | ✅ |
| Delete Table | ❌ | ❌ | ✅ |

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Missing required parameters: partySize, reservationDate, startTime, endTime"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "You are unauthorized to perform this action"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "No tables available for the requested time slot"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "Table is not available at the requested time"
}
```

### 500 Server Error
```json
{
  "status": "error",
  "message": "Error creating reservation: ..."
}
```
