import os
import sys
from src.models import Resource


def init_database(app, db, add_sample_data=False):
    """Initialize the database with tables and optional sample data"""

    with app.app_context():
        print("Initializing Resource Manager Database...")
        
        print("Dropping existing tables...")
        db.drop_all()
        
        print("Creating tables...")
        db.create_all()
        
        if add_sample_data:
            print("Adding sample data...")
            add_sample_resources(db)
        
        print("Database initialized successfully!")


def add_sample_resources(db):
    """Add sample resources for testing"""
    try:
        # Create root folders
        documents_folder = Resource(
            name="Documents",
            is_directory=True,
            path="/Documents",
            parent_id=None,
            resource_type='folder'
        )
        
        reports_folder = Resource(
            name="Reports",
            is_directory=True,
            path="/Reports",
            parent_id=None,
            resource_type='folder'
        )
        
        db.session.add(documents_folder)
        db.session.add(reports_folder)
        db.session.flush()  # Get IDs
        
        # Create a subfolder
        projects_folder = Resource(
            name="Projects",
            is_directory=True,
            path="/Documents/Projects",
            parent_id=documents_folder.id,
            resource_type='folder'
        )
        
        db.session.add(projects_folder)
        db.session.flush()
        
        # Create external resources
        mmm_resource = Resource(
            name="Marketing Campaign Q1",
            is_directory=False,
            path="/Reports/Marketing Campaign Q1",
            parent_id=reports_folder.id,
            size=None,
            mime_type='application/x-mmm',
            resource_type='mmm',
            resource_id='mmm_campaign_q1_2024',
            is_favorite=True
        )
        
        audience_resource = Resource(
            name="Target Audience Analysis",
            is_directory=False,
            path="/Reports/Target Audience Analysis",
            parent_id=reports_folder.id,
            size=None,
            mime_type='application/x-audience',
            resource_type='audience',
            resource_id='audience_analysis_001',
            is_favorite=False
        )
        
        report_resource = Resource(
            name="Q4 Performance Report",
            is_directory=False,
            path="/Reports/Q4 Performance Report",
            parent_id=reports_folder.id,
            size=None,
            mime_type='application/x-report',
            resource_type='report',
            resource_id='report_q4_2023_performance',
            is_favorite=True
        )
        
        db.session.add(mmm_resource)
        db.session.add(audience_resource)
        db.session.add(report_resource)
        
        # Commit all changes
        db.session.commit()
        
        print(f"Added sample resources:")
        print(f"  - {documents_folder.name} (folder)")
        print(f"  - {reports_folder.name} (folder)")
        print(f"  - {projects_folder.name} (subfolder)")
        print(f"  - {mmm_resource.name} (MMM resource, favorite)")
        print(f"  - {audience_resource.name} (audience resource)")
        print(f"  - {report_resource.name} (report resource, favorite)")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding sample data: {e}")
        raise


def reset_database(app, db):
    """Reset the database (drop and recreate)"""
    
    with app.app_context():
        print("Resetting Resource Manager Database...")
        
        # Drop all tables
        print("Dropping all tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating tables...")
        db.create_all()
        
        print("Database reset successfully!")
