# API Documentation

## Base URL
```
Production: https://visite-sri3a.netlify.app/api
Development: http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via NextAuth.js session cookies or API tokens.

### Auth Status
- ✅ **Public**: No authentication required
- 🔒 **Protected**: Requires user authentication
- 👑 **Admin**: Requires admin role
- 🚀 **Super Admin**: Requires super admin role

## Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.
- **Status**: ✅ Public
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+212600000000",
  "preferredLanguage": "fr"
}
```

### POST `/api/auth/forgot-password`
Request password reset.
- **Status**: ✅ Public
- **Body**:
```json
{
  "email": "john@example.com"
}
```

### POST `/api/auth/reset-password`
Reset password with token.
- **Status**: ✅ Public
- **Body**:
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

## User Management

### GET `/api/profile`
Get current user profile.
- **Status**: 🔒 Protected

### PUT `/api/profile`
Update user profile.
- **Status**: 🔒 Protected
- **Body**:
```json
{
  "name": "Updated Name",
  "phone": "+212600000001",
  "preferredLanguage": "ar"
}
```

### PUT `/api/profile/password`
Change user password.
- **Status**: 🔒 Protected
- **Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Inspection Centers

### GET `/api/centers`
Get all inspection centers.
- **Status**: ✅ Public
- **Query Parameters**:
  - `city`: Filter by city
  - `active`: Filter by active status (true/false)

### GET `/api/centers/[id]`
Get specific inspection center.
- **Status**: ✅ Public

## Time Slots

### GET `/api/time-slots`
Get available time slots.
- **Status**: ✅ Public
- **Query Parameters**:
  - `centerId`: Filter by inspection center ID
  - `date`: Filter by date (YYYY-MM-DD)
  - `available`: Show only available slots (true/false)

## Bookings

### GET `/api/bookings`
Get user's bookings.
- **Status**: 🔒 Protected
- **Query Parameters**:
  - `status`: Filter by booking status
  - `limit`: Number of results (default: 10)
  - `offset`: Pagination offset

### POST `/api/bookings`
Create a new booking.
- **Status**: 🔒 Protected
- **Body**:
```json
{
  "carId": "car-id",
  "inspectionCenterId": "center-id",
  "timeSlotId": "slot-id",
  "notes": "Special requirements"
}
```

### GET `/api/bookings/[id]`
Get specific booking details.
- **Status**: 🔒 Protected (own bookings) / 👑 Admin (all bookings)

### POST `/api/bookings/[id]/cancel`
Cancel a booking.
- **Status**: 🔒 Protected
- **Body**:
```json
{
  "reason": "Change of plans"
}
```

## Cars Management

### GET `/api/cars`
Get user's cars.
- **Status**: 🔒 Protected

### POST `/api/cars`
Add a new car.
- **Status**: 🔒 Protected
- **Body**:
```json
{
  "licensePlate": "123-A-45",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020
}
```

### PUT `/api/cars/[id]`
Update car information.
- **Status**: 🔒 Protected

### DELETE `/api/cars/[id]`
Delete a car.
- **Status**: 🔒 Protected

## Payment Integration

### POST `/api/payments/cmi/initiate`
Initiate CMI payment.
- **Status**: 🔒 Protected
- **Body**:
```json
{
  "bookingId": "booking-id",
  "amount": 150.00,
  "currency": "MAD"
}
```

### POST `/api/payments/cmi/callback`
CMI payment callback (webhook).
- **Status**: ✅ Public (CMI gateway)

## Admin Endpoints

### GET `/api/admin/users`
Get all users.
- **Status**: 👑 Admin
- **Query Parameters**:
  - `role`: Filter by user role
  - `search`: Search by name or email
  - `limit`: Number of results
  - `offset`: Pagination offset

### GET `/api/admin/bookings`
Get all bookings.
- **Status**: 👑 Admin
- **Query Parameters**:
  - `status`: Filter by booking status
  - `centerId`: Filter by center
  - `date`: Filter by date range
  - `limit`: Number of results
  - `offset`: Pagination offset

### GET `/api/admin/payments`
Get payment statistics and history.
- **Status**: 👑 Admin

### GET `/api/admin/time-slots`
Get all time slots for management.
- **Status**: 👑 Admin

### POST `/api/admin/time-slots`
Create new time slots.
- **Status**: 👑 Admin
- **Body**:
```json
{
  "inspectionCenterId": "center-id",
  "date": "2024-03-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "capacity": 1,
  "price": 150.00
}
```

### PUT `/api/admin/time-slots/[id]`
Update time slot.
- **Status**: 👑 Admin

### DELETE `/api/admin/time-slots/[id]`
Delete time slot.
- **Status**: 👑 Admin

### POST `/api/admin/time-slots/bulk`
Create multiple time slots.
- **Status**: 👑 Admin
- **Body**:
```json
{
  "inspectionCenterId": "center-id",
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "workingDays": [1, 2, 3, 4, 5],
  "timeSlots": [
    { "startTime": "09:00", "endTime": "10:00", "capacity": 2, "price": 150.00 },
    { "startTime": "10:00", "endTime": "11:00", "capacity": 2, "price": 150.00 }
  ]
}
```

## Testing Endpoints

### POST `/api/admin/email/test`
Test email configuration.
- **Status**: 👑 Admin
- **Body**:
```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test message"
}
```

### POST `/api/admin/notifications/sms/test`
Test SMS configuration.
- **Status**: 👑 Admin
- **Body**:
```json
{
  "to": "+212600000000",
  "message": "Test SMS message"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
API endpoints are rate-limited to prevent abuse:
- Public endpoints: 100 requests per minute
- Authenticated endpoints: 200 requests per minute
- Admin endpoints: 500 requests per minute

## CORS Configuration
The API supports CORS for web applications with appropriate origin restrictions in production.

## Webhooks
- **CMI Payment Callback**: `/api/payments/cmi/callback`
  - Handles payment status updates from CMI gateway
  - Updates booking and payment records
  - Triggers confirmation notifications
