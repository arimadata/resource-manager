import os
import shutil
import mimetypes
from flask import current_app
from werkzeug.utils import secure_filename


class FileUtils:
    """Utility class for file operations"""
    
    @staticmethod
    def get_full_path(relative_path):
        """Get full system path from relative path"""
        upload_folder = current_app.config['UPLOAD_FOLDER']
        return os.path.join(upload_folder, relative_path.lstrip('/'))
    
    @staticmethod
    def ensure_directory_exists(path):
        """Ensure directory exists, create if it doesn't"""
        os.makedirs(path, exist_ok=True)
    
    @staticmethod
    def safe_filename(filename):
        """Generate a safe filename"""
        return secure_filename(filename)
    
    @staticmethod
    def get_mime_type(filename):
        """Get MIME type of file"""
        mime_type, _ = mimetypes.guess_type(filename)
        return mime_type
    
    @staticmethod
    def get_file_size(file_path):
        """Get file size in bytes"""
        try:
            return os.path.getsize(file_path)
        except OSError:
            return None
    
    @staticmethod
    def copy_file(src_path, dest_path):
        """Copy file from source to destination"""
        # Ensure destination directory exists
        FileUtils.ensure_directory_exists(os.path.dirname(dest_path))
        shutil.copy2(src_path, dest_path)
    
    @staticmethod
    def copy_directory(src_path, dest_path):
        """Copy directory from source to destination"""
        shutil.copytree(src_path, dest_path)
    
    @staticmethod
    def move_file_or_directory(src_path, dest_path):
        """Move file or directory from source to destination"""
        # Ensure destination directory exists
        FileUtils.ensure_directory_exists(os.path.dirname(dest_path))
        shutil.move(src_path, dest_path)
    
    @staticmethod
    def delete_file_or_directory(path):
        """Delete file or directory"""
        if os.path.isfile(path):
            os.remove(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)
    
    @staticmethod
    def path_exists(path):
        """Check if path exists"""
        return os.path.exists(path)
    
    @staticmethod
    def is_directory(path):
        """Check if path is a directory"""
        return os.path.isdir(path)
    
    @staticmethod
    def is_file(path):
        """Check if path is a file"""
        return os.path.isfile(path) 