# TeamSync Backend API Documentation

> This documentation might be outdated and is only meant to serve as a basic guide. For specific implementation details, double check with actual source code or use http testing apps such as postman API to confirm expected functionality.

## Authentication Routes (`/auth`)

### POST `/auth/login`
- **Description**: Authenticates a user using their credentials.
- **Request Body**:
    - `username` (string): The user's username.
    - `password` (string): The user's password.
- **Response**:
    - `200 OK`: Successfully authenticated. Sends session cookies back to the client.
    - `401 Unauthorized`: Invalid credentials.
- **Cookies Sent**:
    - `sessionID`: Used to maintain the user's session (created using `passport.serializeUser`).
- **Rate Limiting**: Applied via `authRateLimit`.

### POST `/auth/signup`
- **Description**: Registers a new user.
- **Request Body**:
    - `username` (string): The desired username.
    - `password` (string): The user's password.
- **Response**:
    - `200 OK`: User registered successfully.
    - `400 Bad Request`: Invalid input data.
- > **Important**: This route is **disabled by default** and must be enabled manually in the code. To register users without the API, you must SSH into the backend and run the `backend/registerUser.js` file manually.
- **Cookies Sent**: None.

---

# Team Routes (`/team`)

### GET `/team`
- **Description**: Retrieves all teams, including deleted ones.
- **Response**:
    - `200 OK`: Returns an array of team UUIDs, including those marked as deleted.
        ```json
        {
          "success": true,
          "data": ["teamUUID1", "teamUUID2", "teamUUID3"]
        }
        ```
    - `400 Bad Request`: Error fetching teams.
        ```json
        {
          "success": false,
          "error": "Error fetching all teams"
        }
        ```
- **Authentication**: Not required.
- **Additional Note**: This route includes deleted teams in the returned array of UUIDs, but the details of deleted teams cannot be retrieved unless the user is authenticated.
- **Cookies Sent**: None.

### GET `/team/:id`
- **Description**: Retrieves a specific team by UUID. Returns different data based on authentication status.
- **Parameters**:
    - `id` (UUID): The team's UUID.
- **Response (Authenticated)**:
    - `200 OK`: Returns full team details, including private data and deleted teams.
        ```json
        {
          "success": true,
          "data": {
            "id": "teamUUID",
            "name": "Team Name",
            "teamLead": ["leadUUID"],
            "foundationDate": "2022-01-01T00:00:00.000Z",
            "teamLogo": "https://example.com/logo.png",
            "description": "Team description",
            "discordId": 123456789012345678,
            "customDataPublic": {"key": "value"},
            "customDataPrivate": {"privateKey": "privateValue"},
            "deletionDate": "2023-09-28T00:00:00.000Z"
          }
        }
        ```
- **Response (Not Authenticated)**:
    - `200 OK`: Returns public team details, excluding deleted teams and private data.
        ```json
        {
          "success": true,
          "data": {
            "id": "teamUUID",
            "name": "Team Name",
            "teamLead": ["leadUUID"],
            "foundationDate": "2022-01-01T00:00:00.000Z",
            "teamLogo": "https://example.com/logo.png",
            "description": "Team description",
            "discordId": 123456789012345678,
            "customDataPublic": {"key": "value"}
          }
        }
        ```
- **Authentication**: Not required, but deleted teams are only visible to authenticated users.
- **Cookies Sent**: None.

### GET `/team/discord/:discordId`
- **Description**: Retrieves a team's UUID by its Discord ID.
- **Parameters**:
    - `discordId` (string): The Discord ID of the team.
- **Response**:
    - `200 OK`: Returns the UUID of the team.
        ```json
        {
          "success": true,
          "data": {
            "id": "teamUUID"
          }
        }
        ```
    - `404 Not Found`: Team not found.
        ```json
        {
          "success": false,
          "message": "Team with Discord role ID not found"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### POST `/team`
- **Description**: Creates a new team.
- **Request Body Fields**
  - `name` (string): Required. The team's name.
  - `teamLead` (array of UUIDs): Required. The team's lead UUID(s).
  - `foundationDate` (string): Optional. Defaults to the current date if not provided.
  - `teamLogo` (string): Optional. A URL for the team's logo.
  - `description` (string): Optional. The team's description.
  - `discordId` (BIGINT): Optional. The team's Discord ID.
  - `customDataPublic` (JSON): Optional. Custom public data for the team.
  - `customDataPrivate` (JSON): Optional. Custom private data for the team.
- **Request Body**:
    ```json
    {
      "name": "Team Name",
      "teamLead": ["leadUUID1", "leadUUID2"],
      "foundationDate": "2022-01-01T00:00:00.000Z",
      "teamLogo": "https://example.com/logo.png",
      "description": "Team description",
      "discordId": 123456789012345678,
      "customDataPublic": {"key": "value"},
      "customDataPrivate": {"privateKey": "privateValue"}
    }
    ```
- **Response**:
    - `200 OK`: Team created successfully.
        ```json
        {
          "success": true,
          "data": {
            "id": "teamUUID",
            "name": "Team Name",
            "teamLead": ["leadUUID1", "leadUUID2"],
            "foundationDate": "2022-01-01T00:00:00.000Z",
            "teamLogo": "https://example.com/logo.png",
            "description": "Team description",
            "discordId": 123456789012345678,
            "customDataPublic": {"key": "value"},
            "customDataPrivate": {"privateKey": "privateValue"}
          }
        }
        ```
    - `400 Bad Request`: Invalid input data.
        ```json
        {
          "success": false,
          "message": "Error adding team: Validation error"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### PUT `/team/:id`
- **Description**: Updates an existing team.
- **Parameters**:
    - `id` (UUID): The team's UUID.
- **Request Body Fields**:
  - > at-least one of these fields must be present
  - `name` (string): Optional. The team's name.
  - `teamLead` (array of UUIDs): Optional. The team's lead UUID(s).
  - `foundationDate` (string): Optional. The foundation date.
  - `teamLogo` (string): Optional. A URL for the team's logo.
  - `description` (string): Optional. The team's description.
  - `discordId` (BIGINT): Optional. The team's Discord ID.
  - `customDataPublic` (JSON): Optional. Custom public data.
  - `customDataPrivate` (JSON): Optional. Custom private data.
- **Request Body**:
    ```json
    {
      "name": "Updated Team Name",
      "teamLead": ["newLeadUUID"],
      "foundationDate": "2022-02-01T00:00:00.000Z",
      "teamLogo": "https://example.com/newlogo.png",
      "description": "Updated team description",
      "discordId": 987654321098765432,
      "customDataPublic": {"newKey": "newValue"},
      "customDataPrivate": {"newPrivateKey": "newPrivateValue"}
    }
    ```
- **Response**:
    - `200 OK`: Team updated successfully.
        ```json
        {
          "success": true,
          "data": {
            "id": "teamUUID",
            "name": "Updated Team Name",
            "teamLead": ["newLeadUUID"],
            "foundationDate": "2022-02-01T00:00:00.000Z",
            "teamLogo": "https://example.com/newlogo.png",
            "description": "Updated team description",
            "discordId": 987654321098765432,
            "customDataPublic": {"newKey": "newValue"},
            "customDataPrivate": {"newPrivateKey": "newPrivateValue"}
          }
        }
        ```
    - `400 Bad Request`: Invalid input data.
        ```json
        {
          "success": false,
          "message": "Error updating team"
        }
        ```
    - `404 Not Found`: Team not found.
        ```json
        {
          "success": false,
          "message": "Team not found"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### DELETE `/team/:id`
- **Description**: Deletes (soft deletes) a team.
- **Parameters**:
    - `id` (UUID): The team's UUID.
- **Response**:
    - `200 OK`: Team deleted successfully.
        ```json
        {
          "success": true,
          "data": {
            "id": "teamUUID",
            "deletionDate": "2023-09-28T00:00:00.000Z"
          }
        }
        ```
    - `404 Not Found`: Team not found.
        ```json
        {
          "success": false,
          "message": "Team not found"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

---

## Member Routes (`/member`)

### GET `/member`
- **Description**: Retrieves all members.
- **Response**:
    - `200 OK`: Returns an array of member UUIDs.
        ```json
        {
          "success": true,
          "data": ["memberUUID1", "memberUUID2", "memberUUID3"]
        }
        ```
    - `400 Bad Request`: Error fetching members.
        ```json
        {
          "success": false,
          "error": "Error fetching all members"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### GET `/member/:id`
- **Description**: Retrieves a specific member by UUID. Returns different data based on authentication status.
- **Parameters**:
    - `id` (UUID): The member's UUID.
- **Response (Authenticated)**:
    - `200 OK`: Returns full member details, including private data and members who have left the organization.
        ```json
        {
          "success": true,
          "data": {
            "id": "memberUUID",
            "name": "Member Name",
            "position": "Position",
            "joinDate": "2022-01-01T00:00:00.000Z",
            "profilePicture": "https://example.com/profile.png",
            "phoneNumber": "+1234567890",
            "email": "member@example.com",
            "discordId": 933604018951974924,
            "teams": ["teamUUID1", "teamUUID2"],
            "notes": "Admin notes",
            "customDataPublic": {"key": "value"},
            "customDataPrivate": {"privateKey": "privateValue"},
            "leaveDate": "2023-09-28T00:00:00.000Z"
          }
        }
        ```
- **Response (Not Authenticated)**:
    - `200 OK`: Returns public member details, excluding private data and members who have left the organization.
        ```json
        {
          "success": true,
          "data": {
            "id": "memberUUID",
            "name": "Member Name",
            "position": "Position",
            "joinDate": "2022-01-01T00:00:00.000Z",
            "profilePicture": "https://example.com/profile.png",
            "discordId": 933604018951974924,
            "teams": ["teamUUID1", "teamUUID2"],
            "customDataPublic": {"key": "value"}
          }
        }
        ```
- **Authentication**: Not required, but deleted members (those who have left) are only visible to authenticated users.
- **Cookies Sent**: None.

### GET `/member/discord/:discordId`
- **Description**: Retrieves a member's UUID by their Discord ID.
- **Parameters**:
    - `discordId` (string): The Discord ID of the member.
- **Response**:
    - `200 OK`: Returns the member UUID.
        ```json
        {
          "success": true,
          "data": {
            "id": "memberUUID"
          }
        }
        ```
    - `404 Not Found`: Member not found.
        ```json
        {
          "success": false,
          "message": "Member with Discord ID not found"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### POST `/member`
- **Description**: Creates a new member.
- **Request Body Fields**:
  - `name` (string): Required. The member's name.
  - `position` (string): Required. The member's position.
  - `joinDate` (string): Optional. Defaults to the current date if not provided.
  - `profilePicture` (string): Optional. A URL for the member's profile picture.
  - `phoneNumber` (string): Optional. The member's phone number.
  - `email` (string): Optional. The member's email.
  - `discordId` (BIGINT): Optional. The member's Discord ID.
  - `teams` (array of UUIDs): Optional. The teams the member belongs to.
  - `notes` (string): Optional. Admin notes about the member.
  - `customDataPublic` (JSON): Optional. Custom public data.
  - `customDataPrivate` (JSON): Optional. Custom private data.
- **Request Body**:
    ```json
    {
      "name": "Member Name",
      "position": "Position",
      "joinDate": "2022-01-01T00:00:00.000Z",
      "profilePicture": "https://example.com/profile.png",
      "phoneNumber": "+1234567890",
      "email": "member@example.com",
      "discordId": 933604018951974924,
      "teams": ["teamUUID1", "teamUUID2"],
      "notes": "Admin notes",
      "customDataPublic": {"key": "value"},
      "customDataPrivate": {"privateKey": "privateValue"}
    }
    ```
- **Response**:
    - `200 OK`: Member created successfully.
        ```json
        {
          "success": true,
          "data": {
            "id": "memberUUID",
            "name": "Member Name",
            "position": "Position",
            "joinDate": "2022-01-01T00:00:00.000Z",
            "profilePicture": "https://example.com/profile.png",
            "phoneNumber": "+1234567890",
            "email": "member@example.com",
            "discordId": 933604018951974924,
            "teams": ["teamUUID1", "teamUUID2"],
            "notes": "Admin notes",
            "customDataPublic": {"key": "value"},
            "customDataPrivate": {"privateKey": "privateValue"}
          }
        }
        ```
    - `400 Bad Request`: Invalid input data.
        ```json
        {
          "success": false,
          "message": "Error adding member"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### PUT `/member/:id`
- **Description**: Updates an existing member.
- **Parameters**:
    - `id` (UUID): The member's UUID.
- **Request Body Fields**:
  - `name` (string): Optional. The member's name.
  - `position` (string): Optional. The member's position.
  - `profilePicture` (string): Optional. A URL for the member's profile picture.
  - `phoneNumber` (string): Optional. The member's phone number.
  - `email` (string): Optional. The member's email.
  - `discordId` (BIGINT): Optional. The member's Discord ID.
  - `teams` (array of UUIDs): Optional. The teams the member belongs to.
  - `notes` (string): Optional. Admin notes about the member.
  - `customDataPublic` (JSON): Optional. Custom public data.
  - `customDataPrivate` (JSON): Optional. Custom private data.
- **Request Body**:
    ```json
    {
      "name": "Updated Member Name",
      "position": "Updated Position",
      "profilePicture": "https://example.com/newprofile.png",
      "phoneNumber": "+9876543210",
      "email": "updated@example.com",
      "discordId": 987654321012345678,
      "teams": ["teamUUID3"],
      "notes": "Updated admin notes",
      "customDataPublic": {"newKey": "newValue"},
      "customDataPrivate": {"newPrivateKey": "newPrivateValue"}
    }
    ```
- **Response**:
    - `200 OK`: Member updated successfully.
        ```json
        {
          "success": true,
          "data": {
            "id": "memberUUID",
            "name": "Updated Member Name",
            "position": "Updated Position",
            "profilePicture": "https://example.com/newprofile.png",
            "phoneNumber": "+9876543210",
            "email": "updated@example.com",
            "discordId": 987654321012345678,
            "teams": ["teamUUID3"],
            "notes": "Updated admin notes",
            "customDataPublic": {"newKey": "newValue"},
            "customDataPrivate": {"newPrivateKey": "newPrivateValue"}
          }
        }
        ```
    - `400 Bad Request`: Invalid input data.
        ```json
        {
          "success": false,
          "message": "Error updating member"
        }
        ```
    - `404 Not Found`: Member not found.
        ```json
        {
          "success": false,
          "message": "Member not found"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### DELETE `/member/:id`
- **Description**: Deletes (soft deletes) a member.
- **Parameters**:
    - `id` (UUID): The member's UUID.
- **Response**:
    - `200 OK`: Member deleted successfully.
        ```json
        {
          "success": true,
          "data": {
            "id": "memberUUID",
            "leaveDate": "2023-09-28T00:00:00.000Z"
          }
        }
        ```
    - `404 Not Found`: Member not found.
        ```json
        {
          "success": false,
          "message": "Member not found"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).
- 
---

## Discord Member Routes (`/discord/member`)

### GET `/discord/member`
- **Description**: Retrieves all Discord member IDs.
- **Response**:
    - `200 OK`: Returns an array of Discord member IDs (Discord IDs, not UUIDs).
        ```json
        {
          "success": true,
          "data": [933604018951974924, 933604018951974925]
        }
        ```
    - `400 Bad Request`: Error fetching Discord member IDs.
        ```json
        {
          "success": false,
          "message": "Error fetching Discord member IDs"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### GET `/discord/member/username/:discordUsername`
- **Description**: Retrieves a Discord member by their username.
- **Parameters**:
    - `discordUsername` (string): The Discord username of the member.
- **Response**:
    - `200 OK`: Returns the member's details.
        ```json
        {
          "success": true,
          "data": {
            "discordID": 933604018951974924,
            "discordUsername": "username",
            "discordDisplayName": "Display Name",
            "discordProfilePictureUrl": "https://example.com/profile.png",
            "discordRoles": [933604018951974924, 933604018951974925]
          }
        }
        ```
    - `404 Not Found`: Member not found.
        ```json
        {
          "success": false,
          "message": "Member not found"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### GET `/discord/member/:discordID`
- **Description**: Retrieves a specific Discord member by their Discord ID.
- **Parameters**:
    - `discordID` (BIGINT): The Discord ID of the member.
- **Response**:
    - `200 OK`: Returns the full member details.
        ```json
        {
          "success": true,
          "data": {
            "discordID": 933604018951974924,
            "discordUsername": "username",
            "discordDisplayName": "Display Name",
            "discordProfilePictureUrl": "https://example.com/profile.png",
            "discordRoles": [933604018951974924, 933604018951974925]
          }
        }
        ```
    - `404 Not Found`: Member not found.
        ```json
        {
          "success": false,
          "message": "Member not found"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### POST `/discord/member`
- **Description**: Creates a new Discord member.
- **Request Body Parameters**:
  - `discordID` (BIGINT): Required. The member's Discord ID.
  - `discordUsername` (string): Required. The Discord username.
  - `discordDisplayName` (string): Optional. The member's Discord display name.
  - `discordProfilePictureUrl` (string): Optional. A URL for the member's profile picture.
  - `discordRoles` (array of BIGINTs): Optional. The roles assigned to the member
- **Request Body**:
    ```json
    {
      "discordID": 933604018951974924,
      "discordUsername": "username",
      "discordDisplayName": "Display Name",
      "discordProfilePictureUrl": "https://example.com/profile.png",
      "discordRoles": [933604018951974924, 933604018951974925]
    }
    ```
- **Response**:
    - `200 OK`: Member created successfully.
        ```json
        {
          "success": true,
          "data": {
            "discordID": 933604018951974924,
            "discordUsername": "username",
            "discordDisplayName": "Display Name",
            "discordProfilePictureUrl": "https://example.com/profile.png",
            "discordRoles": [933604018951974924, 933604018951974925]
          }
        }
        ```
    - `400 Bad Request`: Invalid input data.
        ```json
        {
          "success": false,
          "message": "Error creating Discord member"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### DELETE `/discord/member/:discordID`
- **Description**: Deletes a specific Discord member by their Discord ID.
- **Parameters**:
    - `discordID` (BIGINT): The Discord ID of the member.
- **Response**:
    - `200 OK`: Member deleted successfully.
        ```json
        {
          "success": true,
          "message": "Member deleted successfully"
        }
        ```
    - `404 Not Found`: Member not found.
        ```json
        {
          "success": false,
          "message": "Member not found"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### DELETE `/discord/member`
- **Description**: Deletes all Discord members.
- **Response**:
    - `200 OK`: All members deleted successfully.
        ```json
        {
          "success": true,
          "message": "All members deleted successfully"
        }
        ```
    - `400 Bad Request`: Error deleting members.
        ```json
        {
          "success": false,
          "message": "Error deleting all members"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

---

## Discord Role Routes (`/discord/role`)

### GET `/discord/role`
- **Description**: Retrieves all Discord role IDs (Discord IDs, not UUIDs).
- **Response**:
    - `200 OK`: Returns an array of Discord role IDs.
        ```json
        {
          "success": true,
          "data": [933604018951974924, 933604018951974925]
        }
        ```
    - `400 Bad Request`: Error fetching Discord role IDs.
        ```json
        {
          "success": false,
          "message": "Error fetching Discord role IDs"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### GET `/discord/role/:discordRoleID`
- **Description**: Retrieves a Discord role by its ID.
- **Parameters**:
    - `discordRoleID` (BIGINT): The Discord role ID.
- **Response**:
    - `200 OK`: Returns the full role details.
        ```json
        {
          "success": true,
          "data": {
            "discordID": 933604018951974924,
            "roleName": "Admin",
            "roleColor": "#3498db"
          }
        }
        ```
    - `404 Not Found`: Role not found.
        ```json
        {
          "success": false,
          "message": "Role not found"
        }
        ```
- **Authentication**: Not required.
- **Cookies Sent**: None.

### POST `/discord/role`
- **Description**: Creates a new Discord role.
- **Request Body Fields**:
  - `discordID` (BIGINT): Required. The role's Discord ID.
  - `roleName` (string): Required. The role's name.
  - `roleColor` (string): Optional. The role's color.
- **Request Body**:
    ```json
    {
      "discordID": 933604018951974924,
      "roleName": "Admin",
      "roleColor": "#3498db"
    }
    ```
- **Response**:
    - `200 OK`: Role created successfully.
        ```json
        {
          "success": true,
          "data": {
            "discordID": 933604018951974924,
            "roleName": "Admin",
            "discordRoleID": 933604018951974924,
            "roleColor": "#3498db"
          }
        }
        ```
    - `400 Bad Request`: Invalid input data.
        ```json
        {
          "success": false,
          "message": "Error creating Discord role"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### DELETE `/discord/role/:discordRoleID`
- **Description**: Deletes a specific Discord role by its ID.
- **Parameters**:
    - `discordRoleID` (BIGINT): The Discord role ID.
- **Response**:
    - `200 OK`: Role deleted successfully.
        ```json
        {
          "success": true,
          "message": "Role deleted successfully"
        }
        ```
    - `404 Not Found`: Role not found.
        ```json
        {
          "success": false,
          "message": "Role not found"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

### DELETE `/discord/role`
- **Description**: Deletes all Discord roles.
- **Response**:
    - `200 OK`: All roles deleted successfully.
        ```json
        {
          "success": true,
          "message": "All roles deleted successfully"
        }
        ```
    - `400 Bad Request`: Error deleting roles.
        ```json
        {
          "success": false,
          "message": "Error deleting all roles"
        }
        ```
- **Authentication**: Required.
- **Cookies Sent**: Authenticated session cookies (`sessionID`).

---