### API Overview
1. **Endpoint**: `/sync-user`
2. **Method**: `POST`
3. **Authorization**: Ensure you send a `sessionID` cookie with the request (check backend API for reference).
4. **Authorization Check**: The server verifies authorization by making a `GET` request to `/auth/check`.

### Example Request
```http
POST /sync-user
Content-Type: application/json
Cookie: connect.sid=yourSessionIdHere

{
  "memberUUID": "123e4567-e89b-12d3-a456-426614174000",
  "syncType": "both" // Options: "discord-to-backend", "backend-to-discord", "both"
}
```

### Response Format
- **Success**:
```json
{
  "message": "Synchronization completed successfully for member UUID: 123e4567-e89b-12d3-a456-426614174000"
}
```

- **Error**:
```json
{
  "error": "Unauthorized access" // Or other specific error messages
}
```