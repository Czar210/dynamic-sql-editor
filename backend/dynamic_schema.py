from sqlalchemy import Table, Column, Integer, String, Boolean, DateTime, Float, MetaData
from sqlalchemy.schema import CreateTable
from database import engine

metadata = MetaData()

def get_sqlalchemy_type(type_string: str):
    mapping = {
        'Integer': Integer,
        'String': String,
        'Boolean': Boolean,
        'DateTime': DateTime,
        'Float': Float
    }
    return mapping.get(type_string, String)

def create_physical_table(table_name: str, columns_data: list):
    """
    Dynamically creates a physical table in the database
    columns_data should be a list of dicts: 
    [{'name': 'id', 'data_type': 'Integer', 'is_primary': True, 'is_nullable': False}, ...]
    """
    
    # Check if table already exists in metadata to avoid duplication errors locally
    metadata.reflect(bind=engine)
    if table_name in metadata.tables:
        return False, "Table already exists."

    columns = []
    
    # Always ensure there is an ID column if none provided
    has_primary = any(col.get('is_primary') for col in columns_data)
    if not has_primary:
        columns.append(Column('id', Integer, primary_key=True, index=True, autoincrement=True))
        
    for col_data in columns_data:
        # Avoid redefining 'id' if we just auto-added it
        if not has_primary and col_data['name'].lower() == 'id':
            continue
            
        col_type = get_sqlalchemy_type(col_data['data_type'])
        columns.append(
            Column(
                col_data['name'],
                col_type,
                primary_key=col_data.get('is_primary', False),
                nullable=col_data.get('is_nullable', True),
                unique=col_data.get('is_unique', False)
            )
        )
        
    new_table = Table(table_name, metadata, *columns)
    
    # Execute the DDL precisely
    new_table.create(engine)
    
    return True, f"Table {table_name} created successfully."
