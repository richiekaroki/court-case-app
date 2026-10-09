# Kenya Court Cases App

A lightweight full-stack application for looking up Kenyan court cases, managing a personal watchlist, and tracking hearing histories. Built with TypeScript, PostgreSQL, and Express.

## Stack

- **Language**: TypeScript (strict mode)
- **Framework**: Express.js REST API
- **ORM**: Sequelize v6 (PostgreSQL)
- **Testing**: Jest-style unit tests + integration tests
- **Rate Limiting**: express-rate-limit
- **Logging**: Winston (Console + File transport)

## Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables** (see `.env.sample` below)
4. **Compile TypeScript**:
   ```bash
   npx tsc
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Environment Variables

Copy `.env.sample` to `.env` and fill in the values:

```
# Database (PostgreSQL)
DB_NAME=court_cases_db
DB_USER=court_cases_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Application
NODE_ENV=development
PORT=3001
```

**Important**: Never commit `.env` to the repository. The file is already listed in `.gitignore`. All secrets must be provided via environment variables.

## API Endpoints

### Case Lookup

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cases/lookup?caseNumber=Civil Appeal No. E123 of 2024` | Look up a case by case number |
| `GET` | `/api/cases/lookup?partyName=John Doe` | Look up cases by party name |
| `GET` | `/api/cases/lookup?court=High Court` | Look up cases by court station |

**Query Parameters:**
- `caseNumber` - Case number (e.g., "Civil Appeal No. E123 of 2024")
- `partyName` - Party name to search for
- `court` - Court station name

**Response:**
```json
{
  "cases": [...],
  "pagination": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 },
  "parsed": { "original": "Civil Appeal No. E123 of 2024", "valid": true },
  "notFoundMessage": null
}
```

If the case number cannot be parsed, a `notFoundMessage` will be provided with guidance on the correct format.

### Watchlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cases/watchlist` | Add a case to your watchlist |
| `DELETE` | `/api/cases/watchlist/:caseId` | Remove a case from your watchlist |
| `GET` | `/api/cases/watchlist` | Get your watchlist cases |

**POST Body:**
```json
{
  "caseId": 1,
  "court": "High Court",
  "caseNumber": "Civil Appeal No. E123 of 2024",
  "caseType": "Civil Appeal",
  "nextHearingDate": "2024-01-15"
```

**Response**: Returns the watchlist entry with case details.

### Hearing Date Update

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/cases/watchlist/:caseId/hearing` | Update hearing date and record history |

**Query Parameters:**
- `newHearingDate` - New hearing date (ISO format or YYYY-MM-DD)

**Response**: Returns the updated watchlist entry with a hearing history record created.

### Case CRUD (Existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cases/` | Get all cases with pagination |
| `GET` | `/api/cases/recent` | Get recent cases |
| `GET` | `/api/cases/:id` | Get a single case by ID |
| `POST` | `/api/cases/` | Create a new case |
| `PUT` | `/api/cases/:id` | Update a case |
| `DELETE` | `/api/cases/:id` | Delete a case |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns API status and environment |
| `GET` | `/` | Root endpoint with API info |

**Rate Limiting**: 100 requests per 15 minutes per IP address.

## Features

### 1. Case Lookup
- Parses Kenyan case number formats (e.g., "Civil Appeal No. E123 of 2024")
- Tolerates differences in letter case, spacing, "No." vs "No", "E" prefix
- Extracts: court, case type, number, year
- Shows clear message when case cannot be found or parsed
- Supports search by party name and court station

### 2. My Cases Watchlist
- Users save cases with next hearing date
- Email reminders 3 days and 1 day before hearing (Africa/Nairobi time zone)
- SMS reminders can be added later (code designed for easy extension)
- Users can remove cases from their watchlist

### 3. Case Timeline
- History of hearing date changes preserved (old dates kept, not overwritten)
- Outcomes and notes tracked for each hearing change
- Shows full history of a saved case's hearing adjustments

## Kenya Data Protection Act 2019 Compliance

- **Minimal data collection**: Only personal data strictly necessary for the app's functionality is stored
- **User deletion**: Users can request deletion of their data via the API
- **Legal disclaimer**: The app provides information only and is not legal advice
- **Data retention**: Hearing history and watchlist entries are retained only as long as needed
- **Data access**: Users can view and delete their personal data

**Disclaimer**: This app provides information about court cases and is not legal advice. For legal matters, consult a qualified advocate or lawyer.

## Development

### Running Tests
```bash
npm test
```
This runs:
- TypeScript compilation check
- Case number parser unit tests (31 test cases)
- Case ingestion tests

### Adding New Tests
- Unit tests for the case number parser are in `test/test_case_parser.js`
- Add more test cases to the `testCases` array to increase coverage

### Database Migrations
The app uses Sequelize models with `timestamps: false` (consistent with existing codebase). 
To add new tables, create new model files in `src/models/` and export them in `src/models/index.js`.

## Project Structure

```
src/
  app.ts           - Express app initialization
  config/          - Configuration
  controllers/     - Route handlers
  models/          - Sequelize models
  middleware/      - Sequelize instance & connection
  routes/          - Route definitions
  utils/           - Utilities (caseParser, logger)
  services/        - Business logic (CaseIngestionService)
  
test/
  test_case_parser.js  - Unit tests for case number parser
  test_ingestion.js    - Ingestion service tests
  test_phase2.js       - Scraper state tests

.dist/             - Compiled output
.env               - Environment variables (gitignored)
.gitignore         - Git ignore rules
README.md          - This file
```

## API Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `Retry-After` may be set if limit is exceeded
- **Error response**: `429 Too Many Requests` with message

## License

ISC License