# Flask Resource Manager API

A professional Flask-based resource manager backend with PostgreSQL and SQLAlchemy. This API provides comprehensive resource management capabilities for files, folders, and external resources (MMM, reports, audiences) including upload, download, copy, move, rename, delete, and favorite operations.

## Features

- 🗂️ **Resource Management**: Create, read, update, delete files, folders, and external resources
- 📤 **File Upload**: Secure file upload with MIME type detection
- 📥 **File Download**: Direct file download with proper headers and ZIP creation
- 🔄 **Copy & Move**: Copy and move resources with recursive support
- ✏️ **Rename**: Rename resources with path updates
- 👁️ **File Preview**: Serve files for preview with unsupported file type filtering
- 📝 **External Resources**: Create and manage non-file resources (MMM, audience, report types)
- ⭐ **Favorites**: Mark/unmark resources as favorites
- 🏷️ **Resource Types**: Support for file, folder, mmm, audience, and report resource types
- 🔗 **External IDs**: Link to external databases via resource IDs
- 🗃️ **PostgreSQL**: Robust database with SQLAlchemy ORM
- 🔗 **RESTful API**: Clean, RESTful endpoints with proper HTTP methods
- 🔄 **Multi-Format Support**: Supports both JSON and Form data for compatibility
- 📚 **Swagger Documentation**: Auto-generated API documentation
- 🛡️ **Error Handling**: Comprehensive error handling and validation
- 🔧 **Configuration Management**: Environment-based configuration
- 🚀 **Production Ready**: Gunicorn WSGI server support
- ⚡ **FastAPI Integration**: All FastAPI routes integrated with database persistence

## Architecture

This project follows Flask best practices with the **Application Factory Pattern**:

```
flask_backend/
├── app/
│   ├── __init__.py              # Application factory
│   ├── extensions.py            # Flask extensions
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py
│   │   └── file_system.py       # Resource model
│   ├── api/                     # API blueprints
│   │   ├── __init__.py
│   │   └── file_system/
│   │       ├── __init__.py
│   │       ├── routes.py
│   │       └── controllers.py
│   └── utils/                   # Utility functions
│       ├── __init__.py
│       └── file_utils.py
├── static/uploads/              # File storage directory
├── migrations/                  # Database migrations
├── config.py                    # Configuration classes
├── run.py                       # Application entry point
├── requirements.txt             # Python dependencies
├── env.example                  # Environment variables template
└── README.md                    # This file
```

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd flask_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Install PostgreSQL and create a database
createdb resourcemanager_dev

# Or use Docker
docker run -d \
  --name postgres-resourcemanager \
  -e POSTGRES_DB=resourcemanager_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13

docker run -d --name postgres-resourcemanager -e POSTGRES_DB=resourcemanager_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:13
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://postgres:password@localhost:5432/resourcemanager_dev
```

### 4. Initialize Database

```bash
# Initialize database tables
flask init-db

# Or reset database if needed
flask reset-db
```

### 5. Run the Application

```bash
# Development server
python run.py

# Or using Flask CLI
flask run

# Production server (install gunicorn first)
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

The API will be available at `http://localhost:5000`

## API Documentation

Once the server is running, visit `http://localhost:5000/api-docs/` for interactive Swagger documentation.

### Base URL

```
http://localhost:5000/api/file-system
```

### Endpoints

#### 📁 Create Folder

```http
POST /folder
Content-Type: application/json

{
  "name": "My Folder",
  "parentId": 1  // optional, null for root
}
```

#### 📤 Upload File

```http
POST /upload
Content-Type: multipart/form-data

file: <file>
parentId: 1  // optional, null for root
```

#### 📋 Get Resources

```http
GET /  // Returns all resources (files, folders, and external resources)
```

#### 📄 Download Resource(s)

```http
GET /download?files=123  // Single resource
GET /download?files=123,456,789  // Multiple resources (creates ZIP)
```

#### 🔄 Copy Resources

```http
POST /copy
Content-Type: application/json

{
  "sourceIds": [123, 456],
  "destinationId": 789  // optional, null for root
}
```

#### ➡️ Move Resources

```http
PUT /move
Content-Type: application/json

{
  "sourceIds": [123, 456],
  "destinationId": 789  // optional, null for root
}
```

#### ✏️ Rename Resource

```http
PATCH /rename
Content-Type: application/json

{
  "id": 123,
  "newName": "New Name.txt"
}
```

#### 🗑️ Delete Resources

```http
DELETE /
Content-Type: application/json

{
  "ids": [123, 456, 789]
}
```

#### ⭐ Toggle Favorite

```http
POST /favorite
Content-Type: application/json

{
  "id": 123,
  "isFavorited": true  // optional, will toggle if not provided
}
```

#### 👁️ Preview File

```http
GET /preview/{file_path}  // Serve file for preview
```

#### 📝 Create External Resource

```http
POST /item
Content-Type: application/json

{
  "name": "My Report",
  "parentId": 123,  // optional, null for root
  "type": "report",  // mmm, audience, or report
  "resourceId": "ext_report_456"  // optional, external resource ID
}
```

#### 📥 Download by Path (FastAPI style)

```http
GET /download//{file_path}  // Download file by path
```

## Database Schema

### Resources Table

| Column        | Type         | Description                                   |
| ------------- | ------------ | --------------------------------------------- |
| id            | Integer      | Primary key                                   |
| name          | String(255)  | Resource name                                 |
| is_directory  | Boolean      | True for folders, false for files/resources   |
| path          | String(1000) | Full path from root                           |
| parent_id     | Integer      | Foreign key to parent folder                  |
| size          | BigInteger   | File size in bytes (null for folders/virtual) |
| mime_type     | String(100)  | MIME type (null for folders)                  |
| resource_type | String(50)   | Type: file, folder, mmm, audience, report     |
| resource_id   | String(255)  | External resource ID (for non-file types)     |
| is_favorite   | Boolean      | Favorite status (default: false)              |
| created_at    | DateTime     | Creation timestamp                            |
| updated_at    | DateTime     | Last modification timestamp                   |

## Configuration

The application supports multiple environments through configuration classes:

- **Development**: Debug enabled, local PostgreSQL
- **Production**: Debug disabled, environment-based database URL
- **Testing**: In-memory SQLite for tests

### Environment Variables

| Variable           | Description                            | Default                                                           |
| ------------------ | -------------------------------------- | ----------------------------------------------------------------- |
| FLASK_ENV          | Environment (development/production)   | development                                                       |
| SECRET_KEY         | Flask secret key                       | dev-secret-key-change-in-production                               |
| DATABASE_URL       | PostgreSQL connection string           | postgresql://postgres:password@localhost:5432/resourcemanager_dev |
| CORS_ORIGINS       | Allowed CORS origins (comma-separated) | http://localhost:3000                                             |
| MAX_CONTENT_LENGTH | Maximum file upload size in bytes      | 52428800 (50MB)                                                   |

## Error Handling

The API provides consistent error responses:

```json
{
  "error": "Description of the error"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

- ✅ **Secure Filenames**: Werkzeug's `secure_filename()` prevents path traversal
- ✅ **File Size Limits**: Configurable maximum upload size
- ✅ **MIME Type Detection**: Automatic MIME type detection and storage
- ✅ **CORS Protection**: Configurable CORS origins
- ✅ **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- ✅ **Path Validation**: Prevents access outside upload directory

## Testing

```bash
# Run tests (when implemented)
python -m pytest

# Run with coverage
python -m pytest --cov=app
```

## Deployment

### Using Gunicorn (Recommended)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flask team for the excellent web framework
- SQLAlchemy team for the powerful ORM
- PostgreSQL team for the robust database system
