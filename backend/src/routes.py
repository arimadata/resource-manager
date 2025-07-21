import os
import zipfile
import tempfile
import mimetypes
from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
from sqlalchemy.exc import IntegrityError

from src import db
from src.models import Resource
from src.utils.file_utils import FileUtils

bp = Blueprint('file_system', __name__)


# Create folder endpoint
@bp.route('/folder', methods=['POST'])
def create_folder():
    """
    Create a new folder.

    Args:
        name (str): The name of the folder to create.
        parentId (int, optional): The ID of the parent folder. If not provided,
            folder will be created in root.

    Returns:
        tuple: A tuple containing:
            - dict: The created folder's data if successful
            - int: HTTP status code
                - 201: Folder created successfully
                - 400: Invalid request or folder already exists
                - 500: Internal server error

    Raises:
        IntegrityError: If folder already exists
        Exception: For other internal errors
    """
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Folder name is required'}), 400
        
        name = data['name']
        parent_id = data.get('parentId')
        parent_folder = None
        
        # Handle both ID-based (Node.js style) and path-based (FastAPI style) parentId
        if parent_id:
            if isinstance(parent_id, int):
                # ID-based (Node.js style)
                parent_folder = Resource.query.get(parent_id)
            else:
                # Path-based (FastAPI style)
                parent_folder = Resource.query.filter_by(path=f"/{parent_id}").first()
                parent_id = parent_folder.id if parent_folder else None
        
        # Calculate folder path
        if parent_folder:
            if not parent_folder.is_directory:
                return jsonify({'error': 'Invalid parentId'}), 400
            folder_path = f"{parent_folder.path}/{name}"
        else:
            folder_path = f"/{name}"
        
        # Check if folder already exists in database
        existing_folder = Resource.query.filter_by(path=folder_path).first()
        if existing_folder:
            return jsonify({'error': 'Folder already exists!'}), 400
        
        # Create physical folder
        full_folder_path = FileUtils.get_full_path(folder_path)
        if FileUtils.path_exists(full_folder_path):
            return jsonify({'error': 'Folder already exists!'}), 400
        
        FileUtils.ensure_directory_exists(full_folder_path)
        
        # Create database record
        new_folder = Resource(
            name=name,
            is_directory=True,
            path=folder_path,
            parent_id=parent_id,
            resource_type='folder'
        )
        
        db.session.add(new_folder)
        db.session.commit()
        
        return jsonify(new_folder.to_dict()), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Folder already exists!'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Upload file endpoint
@bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Upload a file to the system.

    Args:
        file (FileStorage): The file to upload, must be provided in form-data.
        parentId (int, optional): The ID of the parent folder. If not provided,
            file will be uploaded to root.

    Returns:
        tuple: A tuple containing:
            - dict: The uploaded file's data if successful
            - int: HTTP status code
                - 201: File uploaded successfully
                - 400: Invalid request or missing file
                - 500: Internal server error

    Raises:
        Exception: For internal errors during file upload or database operations
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        parent_id = request.form.get('parentId')
        parent_folder = None
        
        # Handle both ID-based (Node.js style) and path-based (FastAPI style) parentId
        if parent_id:
            try:
                # Try to parse as integer (Node.js style)
                parent_id = int(parent_id)
                parent_folder = Resource.query.get(parent_id)
            except ValueError:
                # Treat as path (FastAPI style)
                parent_folder = Resource.query.filter_by(path=f"/{parent_id}").first()
                parent_id = parent_folder.id if parent_folder else None
        
        # Secure filename
        filename = FileUtils.safe_filename(file.filename)
        
        # Calculate file path
        if parent_folder:
            if not parent_folder.is_directory:
                return jsonify({'error': 'Invalid parentId'}), 400
            file_path = f"{parent_folder.path}/{filename}"
        else:
            file_path = f"/{filename}"
        
        # Check if file already exists
        existing_file = Resource.query.filter_by(path=file_path).first()
        if existing_file:
            return jsonify({'error': 'File already exists!'}), 400
        
        # Save physical file
        full_file_path = FileUtils.get_full_path(file_path)
        FileUtils.ensure_directory_exists(os.path.dirname(full_file_path))
        file.save(full_file_path)
        
        # Get file info
        file_size = FileUtils.get_file_size(full_file_path)
        mime_type = FileUtils.get_mime_type(filename)
        
        # Create database record
        new_file = Resource(
            name=filename,
            is_directory=False,
            path=file_path,
            parent_id=parent_id,
            size=file_size,
            mime_type=mime_type,
            resource_type='file'
        )
        
        db.session.add(new_file)
        db.session.commit()
        
        return jsonify(new_file.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Get items endpoint
@bp.route('/', methods=['GET'])
def get_items():
    """
    Get all resources in the system.

    Returns:
        tuple: A tuple containing:
            - list: List of all resources as dictionaries
            - int: HTTP status code
                - 200: Resources retrieved successfully
                - 500: Internal server error

    Raises:
        Exception: For internal errors during database operations
    """
    try:
        # Return all items (matching Node.js behavior)
        items = Resource.query.all()
        return jsonify([item.to_dict() for item in items]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Preview file endpoint (from FastAPI)
@bp.route('/preview/<path:file_path>', methods=['GET'])
def preview_file(file_path):
    """
    Provide file previews by serving the file from disk.

    Args:
        file_path (str): Relative path to the file to preview.

    Returns:
        tuple: A tuple containing:
            - file: The file content for preview
            - int: HTTP status code
                - 200: File served successfully
                - 400: File type not supported for preview
                - 404: File not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during file serving
    """
    try:
        # Find the file in database
        file_item = Resource.query.filter_by(path=f"/{file_path}").first()
        if not file_item or file_item.is_directory:
            return jsonify({'error': 'File not found'}), 404
        
        # Get full file path
        full_path = FileUtils.get_full_path(file_item.path)
        
        if not FileUtils.path_exists(full_path):
            return jsonify({'error': 'Physical file not found'}), 404
        
        # Check for unsupported file types
        unsupported_extensions = ['.js']
        file_ext = os.path.splitext(file_item.name)[1].lower()
        if file_ext in unsupported_extensions:
            return jsonify({'error': 'File type not supported for preview'}), 400
        
        # Serve the file for preview
        return send_file(
            full_path,
            download_name=file_item.name,
            mimetype=file_item.mime_type
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Create item endpoint (from FastAPI)
@bp.route('/item', methods=['POST'])
def create_item():
    """
    Create a non-file item (mmm, audience, or report).

    Args:
        name (str): Name of the item to create.
        type (str): Type of item to create. Must be one of: mmm, audience, report.
        parentId (int, optional): ID of the parent folder. If not provided,
            item will be created in root.
        resourceId (str, optional): External resource ID for the item.

    Returns:
        tuple: A tuple containing:
            - dict: The created item's data if successful
            - int: HTTP status code
                - 201: Item created successfully
                - 400: Invalid request or item already exists
                - 500: Internal server error

    Raises:
        IntegrityError: If item already exists
        Exception: For other internal errors
    """
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'type' not in data:
            return jsonify({'error': 'name and type are required'}), 400
        
        name = data['name']
        item_type = data['type']
        parent_id = data.get('parentId')
        
        # Validate item type
        valid_types = ['mmm', 'audience', 'report']
        if item_type not in valid_types:
            return jsonify({'error': f'Invalid type. Must be one of: {", ".join(valid_types)}'}), 400
        
        # Get resource_id if provided
        resource_id = data.get('resourceId')
        
        # Calculate item path
        if parent_id:
            parent_folder = Resource.query.get(parent_id)
            if not parent_folder or not parent_folder.is_directory:
                return jsonify({'error': 'Invalid parentId'}), 400
            item_path = f"{parent_folder.path}/{name}"
        else:
            item_path = f"/{name}"
        
        # Check if item already exists in database
        existing_item = Resource.query.filter_by(path=item_path).first()
        if existing_item:
            return jsonify({'error': 'Item already exists!'}), 400
        
        # Create database record (no physical file for these item types)
        new_item = Resource(
            name=name,
            is_directory=False,
            path=item_path,
            parent_id=parent_id,
            size=None,
            mime_type=f'application/x-{item_type}',  # Custom MIME type for these items
            resource_type=item_type,
            resource_id=resource_id
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify(new_item.to_dict()), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Item already exists!'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Toggle favorite endpoint
@bp.route('/favorite', methods=['POST'])
def toggle_favorite():
    """
    Toggle favorite status of a resource.

    Args:
        id (int): Resource ID to toggle favorite status.
        isFavorited (bool, optional): New favorite status. If not provided,
            current status will be toggled.

    Returns:
        tuple: A tuple containing:
            - dict: Updated resource data and success message
            - int: HTTP status code
                - 200: Favorite status updated successfully
                - 404: Resource not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during database operations
    """
    try:
        data = request.get_json()
        if not data or 'id' not in data:
            return jsonify({'error': 'Resource id is required'}), 400
        
        resource_id = data['id']
        resource = Resource.query.get(resource_id)
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        # Toggle favorite status or set to specific value
        if 'isFavorited' in data:
            resource.is_favorite = data['isFavorite']
        else:
            resource.is_favorite = not resource.is_favorite
        
        db.session.commit()
        
        return jsonify({
            'message': f'Resource {"added to" if resource.is_favorite else "removed from"} favorites',
            'resource': resource.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Copy item endpoint
@bp.route('/copy', methods=['POST'])
def copy_item():
    """
    Copy files/folders to destination folder.

    Args:
        sourceIds (list[int]): Array of item IDs to copy.
        destinationId (int, optional): Destination folder ID. If not provided,
            items will be copied to root.

    Returns:
        tuple: A tuple containing:
            - dict: Success message
            - int: HTTP status code
                - 200: Items copied successfully
                - 400: Invalid request
                - 404: One or more source items not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during copy operation
    """
    try:
        data = request.get_json()
        if not data or 'sourceIds' not in data:
            return jsonify({'error': 'Invalid request body, expected an array of sourceIds.'}), 400
        
        source_ids = data['sourceIds']
        destination_id = data.get('destinationId')
        
        if not isinstance(source_ids, list) or len(source_ids) == 0:
            return jsonify({'error': 'Invalid request body, expected an array of sourceIds.'}), 400
        
        # Validate source items exist
        source_items = Resource.query.filter(Resource.id.in_(source_ids)).all()
        if len(source_items) != len(source_ids):
            return jsonify({'error': 'One or more of the provided sourceIds do not exist.'}), 404
        
        # Get destination folder if specified
        destination_folder = None
        if destination_id:
            destination_folder = Resource.query.get(destination_id)
            if not destination_folder or not destination_folder.is_directory:
                return jsonify({'error': 'Invalid destinationId!'}), 400
        
        # Copy each item
        for source_item in source_items:
            if destination_folder:
                new_path = f"{destination_folder.path}/{source_item.name}"
            else:
                new_path = f"/{source_item.name}"
            
            # Copy physical file/folder
            source_full_path = FileUtils.get_full_path(source_item.path)
            destination_full_path = FileUtils.get_full_path(new_path)
            
            if source_item.is_directory:
                FileUtils.copy_directory(source_full_path, destination_full_path)
                _copy_directory_recursive(source_item, destination_id, new_path)
            else:
                FileUtils.copy_file(source_full_path, destination_full_path)
                new_item = Resource(
                    name=source_item.name,
                    is_directory=False,
                    path=new_path,
                    parent_id=destination_id,
                    size=source_item.size,
                    mime_type=source_item.mime_type,
                    resource_type=source_item.resource_type,
                    resource_id=source_item.resource_id
                )
                db.session.add(new_item)
        
        db.session.commit()
        return jsonify({'message': 'Item(s) copied successfully!'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def _copy_directory_recursive(source_dir, parent_id, new_path):
    """Helper method to recursively copy directory and its contents"""
    # Create new directory record
    new_dir = Resource(
        name=source_dir.name,
        is_directory=True,
        path=new_path,
        parent_id=parent_id,
        resource_type='folder'
    )
    db.session.add(new_dir)
    db.session.flush()  # Get the ID
    
    # Copy all children
    for child in source_dir.children:
        child_new_path = f"{new_path}/{child.name}"
        if child.is_directory:
            _copy_directory_recursive(child, new_dir.id, child_new_path)
        else:
            new_child = Resource(
                name=child.name,
                is_directory=False,
                path=child_new_path,
                parent_id=new_dir.id,
                size=child.size,
                mime_type=child.mime_type,
                resource_type=child.resource_type,
                resource_id=child.resource_id
            )
            db.session.add(new_child)
    
    return new_dir


# Move item endpoint
@bp.route('/move', methods=['PUT'])
def move_item():
    """
    Move files/folders to destination folder.

    Supports both JSON and Form data for compatibility.

    Args:
        sourceIds (list[int] or str): Array of item IDs to move, or source path for form data.
        destinationId (int or str, optional): Destination folder ID or path. If not provided,
            items will be moved to root.

    Returns:
        tuple: A tuple containing:
            - dict: Success message
            - int: HTTP status code
                - 200: Items moved successfully
                - 400: Invalid request
                - 404: One or more source items not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during move operation
    """
    try:
        # Support both JSON and Form data (FastAPI compatibility)
        if request.is_json:
            data = request.get_json()
            if not data or 'sourceIds' not in data:
                return jsonify({'error': 'Invalid request body, expected an array of sourceIds.'}), 400
            
            source_ids = data['sourceIds']
            destination_id = data.get('destinationId')
        else:
            # Form data support (FastAPI style)
            source = request.form.get('source')
            destination = request.form.get('destination')
            
            if not source or not destination:
                return jsonify({'error': 'source and destination are required'}), 400
            
            # Convert path-based to ID-based for database lookup
            source_item = Resource.query.filter_by(path=f"/{source}").first()
            dest_item = Resource.query.filter_by(path=f"/{destination}").first()
            
            if not source_item:
                return jsonify({'error': 'Source not found'}), 404
            
            source_ids = [source_item.id]
            destination_id = dest_item.id if dest_item else None
        
        if isinstance(source_ids, list) and len(source_ids) == 0:
            return jsonify({'error': 'Invalid request body, expected an array of sourceIds.'}), 400
        
        # Validate source items exist
        source_items = Resource.query.filter(Resource.id.in_(source_ids)).all()
        if len(source_items) != len(source_ids):
            return jsonify({'error': 'One or more of the provided sourceIds do not exist.'}), 404
        
        # Get destination folder if specified
        destination_folder = None
        if destination_id:
            destination_folder = Resource.query.get(destination_id)
            if not destination_folder or not destination_folder.is_directory:
                return jsonify({'error': 'Invalid destinationId!'}), 400
        
        # Move each item
        for source_item in source_items:
            if destination_folder:
                new_path = f"{destination_folder.path}/{source_item.name}"
            else:
                new_path = f"/{source_item.name}"
            
            # Move physical file/folder (only if it's a real file, not virtual item)
            if not source_item.mime_type or not source_item.mime_type.startswith('application/x-'):
                source_full_path = FileUtils.get_full_path(source_item.path)
                destination_full_path = FileUtils.get_full_path(new_path)
                if FileUtils.path_exists(source_full_path):
                    FileUtils.move_file_or_directory(source_full_path, destination_full_path)
            
            # Update database records using recursive move
            _move_item_recursive(source_item, destination_id, new_path)
        
        db.session.commit()
        return jsonify({'message': 'Item(s) moved successfully!'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def _move_item_recursive(source_item, destination_id, new_path):
    """Helper method to recursively move items (Node.js style)"""
    # Create new item at destination
    new_item = Resource(
        name=source_item.name,
        is_directory=source_item.is_directory,
        path=new_path,
        parent_id=destination_id,
        size=source_item.size,
        mime_type=source_item.mime_type,
        resource_type=source_item.resource_type,
        resource_id=source_item.resource_id,
        is_favorite=source_item.is_favorite
    )
    db.session.add(new_item)
    db.session.flush()  # Get the ID
    
    # Move children recursively
    if source_item.is_directory:
        for child in source_item.children:
            child_new_path = f"{new_path}/{child.name}"
            _move_item_recursive(child, new_item.id, child_new_path)
    
    # Delete original item
    db.session.delete(source_item)


def _update_children_paths_recursive(item):
    """Helper method to recursively update children paths after rename"""
    if item.is_directory:
        for child in item.children:
            child.path = f"{item.path}/{child.name}"
            db.session.add(child)  # Mark for update
            if child.is_directory:
                _update_children_paths_recursive(child)


def _update_paths_recursive(item, new_path, old_path):
    """Helper method to recursively update paths"""
    item.path = new_path
    
    if item.is_directory:
        for child in item.children:
            child_new_path = child.path.replace(old_path, new_path, 1)
            _update_paths_recursive(child, child_new_path, child.path)


# Rename item endpoint
@bp.route('/rename', methods=['PATCH'])
def rename_item():
    """
    Rename a file or folder.

    Supports both JSON and Form data for compatibility.

    Args:
        id (int or str): ID of item to rename, or source path for form data.
        newName (str): New name for the item.

    Returns:
        tuple: A tuple containing:
            - dict: Updated item data and success message
            - int: HTTP status code
                - 200: Item renamed successfully
                - 400: Invalid request or name already exists
                - 404: Item not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during rename operation
    """
    try:
        # Support both JSON and Form data (FastAPI compatibility)
        if request.is_json:
            data = request.get_json()
            if not data or 'id' not in data or 'newName' not in data:
                return jsonify({'error': 'id and newName are required'}), 400
            
            item_id = data['id']
            new_name = data['newName']
            
            # Get item
            item = Resource.query.get(item_id)
        else:
            # Form data support (FastAPI style)
            source = request.form.get('source')
            new_name = request.form.get('new_name')
            
            if not source or not new_name:
                return jsonify({'error': 'source and new_name are required'}), 400
            
            # Convert path-based to item lookup
            item = Resource.query.filter_by(path=f"/{source}").first()
        
        if not item:
            return jsonify({'error': 'File or Folder not found!'}), 404
        
        # Calculate new path
        path_parts = item.path.rsplit('/', 1)
        if len(path_parts) == 2 and path_parts[0]:
            new_path = f"{path_parts[0]}/{new_name}"
        else:
            new_path = f"/{new_name}"
        
        # Check if item with new name already exists
        old_full_path = FileUtils.get_full_path(item.path)
        new_full_path = FileUtils.get_full_path(new_path)
        
        # Only check physical files for real files, not virtual items
        if not item.mime_type or not item.mime_type.startswith('application/x-'):
            if FileUtils.path_exists(new_full_path):
                return jsonify({'error': 'A file or folder with that name already exists!'}), 400
            
            # Rename physical file/folder
            if FileUtils.path_exists(old_full_path):
                FileUtils.move_file_or_directory(old_full_path, new_full_path)
        
        # Update database records
        old_path = item.path
        item.name = new_name
        item.path = new_path
        
        # Update children paths recursively if it's a directory
        if item.is_directory:
            _update_children_paths_recursive(item)
        
        db.session.commit()
        return jsonify({'message': 'File or Folder renamed successfully!', 'item': item.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Delete item endpoint
@bp.route('/', methods=['DELETE'])
def delete_item():
    """
    Delete files/folders from the system.

    Args:
        ids (list[int]): Array of item IDs to delete.

    Returns:
        tuple: A tuple containing:
            - dict: Success message
            - int: HTTP status code
                - 200: Items deleted successfully
                - 400: Invalid request
                - 404: One or more items not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during delete operation
    """
    try:
        data = request.get_json()
        if not data or 'ids' not in data:
            return jsonify({'error': 'Invalid request body, expected an array of ids.'}), 400
        
        ids = data['ids']
        
        if not isinstance(ids, list) or len(ids) == 0:
            return jsonify({'error': 'Invalid request body, expected an array of ids.'}), 400
        
        # Validate items exist
        items = Resource.query.filter(Resource.id.in_(ids)).all()
        if len(items) != len(ids):
            return jsonify({'error': 'One or more of the provided ids do not exist.'}), 404
        
        # Delete each item
        for item in items:
            # Delete physical file/folder (only if it's a real file, not virtual item)
            if not item.mime_type or not item.mime_type.startswith('application/x-'):
                full_path = FileUtils.get_full_path(item.path)
                if FileUtils.path_exists(full_path):
                    FileUtils.delete_file_or_directory(full_path)
            
            # Delete database records recursively
            _delete_recursive(item)
        
        db.session.commit()
        return jsonify({'message': 'File(s) or Folder(s) deleted successfully.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def _delete_recursive(item):
    """Helper method to recursively delete items"""
    if item.is_directory:
        for child in item.children:
            _delete_recursive(child)
    
    db.session.delete(item)


# Download file endpoint
@bp.route('/download', methods=['GET'])
def download_file():
    """
    Download file(s) or folder(s).

    Args:
        files (str): File ID or comma-separated/array of file IDs to download.

    Returns:
        tuple: A tuple containing:
            - file: The file content or ZIP archive for multiple files
            - int: HTTP status code
                - 200: File(s) downloaded successfully
                - 400: Invalid request
                - 404: One or more files not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during download operation
    """
    try:
        files_param = request.args.get('files')
        if not files_param:
            return jsonify({'error': 'Invalid request body, expected a file ID or an array of file IDs.'}), 400
        
        # Handle single file ID
        try:
            file_id = int(files_param)
            file_item = Resource.query.get(file_id)
            if not file_item:
                return jsonify({'error': 'File not found!'}), 404
            
            # If it's a single file (not directory), download directly
            if not file_item.is_directory:
                full_path = FileUtils.get_full_path(file_item.path)
                if FileUtils.path_exists(full_path):
                    return send_file(
                        full_path,
                        as_attachment=True,
                        download_name=file_item.name,
                        mimetype=file_item.mime_type
                    )
                else:
                    return jsonify({'error': 'File not found'}), 404
            
            # If it's a directory, treat as multiple files
            files_to_zip = [file_item]
            
        except ValueError:
            # Handle multiple file IDs (comma-separated or array format)
            try:
                if ',' in files_param:
                    file_ids = [int(id.strip()) for id in files_param.split(',')]
                else:
                    # Try to parse as JSON array
                    import json
                    file_ids = json.loads(files_param)
                    if not isinstance(file_ids, list):
                        file_ids = [file_ids]
            except:
                return jsonify({'error': 'Invalid file IDs format'}), 400
            
            files_to_zip = Resource.query.filter(Resource.id.in_(file_ids)).all()
            if len(files_to_zip) != len(file_ids):
                return jsonify({'error': 'One or more of the provided file IDs do not exist.'}), 404
        
        # Create ZIP file for multiple files or directories
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, 'download.zip')
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_item in files_to_zip:
                full_path = FileUtils.get_full_path(file_item.path)
                if FileUtils.path_exists(full_path):
                    if file_item.is_directory:
                        # Add directory recursively
                        for root, dirs, files in os.walk(full_path):
                            for file in files:
                                file_path = os.path.join(root, file)
                                arcname = os.path.join(file_item.name, os.path.relpath(file_path, full_path))
                                zipf.write(file_path, arcname)
                    else:
                        # Add single file
                        zipf.write(full_path, file_item.name)
        
        return send_file(
            zip_path,
            as_attachment=True,
            download_name='download.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Download file endpoint (FastAPI style with double slash)
@bp.route('/download//<path:file_path>', methods=['GET'])
def download_file_by_path(file_path):
    """
    Download file by path (FastAPI style).

    Args:
        file_path (str): Path to the file to download.

    Returns:
        tuple: A tuple containing:
            - file: The file content or ZIP archive for directories
            - int: HTTP status code
                - 200: File downloaded successfully
                - 404: File not found
                - 500: Internal server error

    Raises:
        Exception: For internal errors during download operation
    """
    try:
        # Find the file in database by path
        file_item = Resource.query.filter_by(path=f"/{file_path}").first()
        if not file_item:
            return jsonify({'error': 'File/Folder not found'}), 404
        
        # Get full file path
        full_path = FileUtils.get_full_path(file_item.path)
        
        if not FileUtils.path_exists(full_path):
            return jsonify({'error': 'Physical file not found'}), 404
        
        if FileUtils.is_file(full_path):
            # Single file download
            return send_file(
                full_path,
                as_attachment=True,
                download_name=file_item.name,
                mimetype=file_item.mime_type
            )
        else:
            # Directory download - create ZIP
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, f"{file_item.name}.zip")
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(full_path):
                    for file in files:
                        file_path_full = os.path.join(root, file)
                        arcname = os.path.relpath(file_path_full, os.path.dirname(full_path))
                        zipf.write(file_path_full, arcname=arcname)
            
            return send_file(
                zip_path,
                as_attachment=True,
                download_name=f"{file_item.name}.zip",
                mimetype='application/zip'
            )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 