from datetime import datetime
from src import db


class Resource(db.Model):
    """Resource model representing files, folders, and external resources"""
    __tablename__ = 'resources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    is_directory = db.Column(db.Boolean, nullable=False)
    path = db.Column(db.String(1000), nullable=False, unique=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('resources.id'), nullable=True)
    size = db.Column(db.BigInteger, nullable=True)  # For files only
    mime_type = db.Column(db.String(100), nullable=True)  # For files only
    resource_type = db.Column(db.String(50), nullable=False, default='file')  # file, folder, mmm, report, audience
    resource_id = db.Column(db.String(255), nullable=True)  # External resource ID for non-file types
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Self-referential relationship for parent-child hierarchy
    parent = db.relationship('Resource', remote_side=[id], backref='children')
    
    def __init__(self, name, is_directory, path, parent_id=None, size=None, mime_type=None, 
                 resource_type='file', resource_id=None, is_favorite=False):
        self.name = name
        self.is_directory = is_directory
        self.path = path
        self.parent_id = parent_id
        self.size = size
        self.mime_type = mime_type
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.is_favorite = is_favorite
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        # Generate file preview URL if it's a file
        file_preview_path = None
        if not self.is_directory and self.resource_type == 'file' and self.mime_type:
            # Only generate preview for actual files
            file_preview_path = f"/api/file-system/preview{self.path}"
        
        return {
            'id': self.id,
            '_id': str(self.id),  # For compatibility with frontend expecting MongoDB _id
            'name': self.name,
            'isDirectory': self.is_directory,
            'path': self.path,
            'parentId': self.parent_id,
            'size': self.size,
            'mimeType': self.mime_type,
            'type': self.resource_type,  # Resource type (file, folder, mmm, report, audience)
            'resourceId': self.resource_id,  # External resource ID
            'isFavorited': self.is_favorite,
            'filePreviewPath': file_preview_path,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            '__v': 0  # For MongoDB compatibility
        }
    
    def __repr__(self):
        return f'<Resource {self.name} ({self.path}) - {self.resource_type}>' 