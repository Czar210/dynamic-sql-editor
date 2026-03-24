from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, Base, get_db
from dynamic_schema import create_physical_table

# Create metadata tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dynamic Template API")

# Setup CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Dynamic Template API"}

@app.post("/tables/", response_model=schemas.TableResponse)
def create_table(table: schemas.TableCreate, db: Session = Depends(get_db)):
    # 1. Register in meta table
    db_table = models.DynamicTable(name=table.name, description=table.description)
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    
    created_columns = []
    cols_data_for_ddl = []
    
    # 2. Register columns
    for col in table.columns:
        db_col = models.DynamicColumn(
            table_id=db_table.id,
            name=col.name,
            data_type=col.data_type,
            is_nullable=col.is_nullable,
            is_unique=col.is_unique,
            is_primary=col.is_primary
        )
        db.add(db_col)
        created_columns.append(db_col)
        cols_data_for_ddl.append({
            'name': col.name,
            'data_type': col.data_type,
            'is_nullable': col.is_nullable,
            'is_unique': col.is_unique,
            'is_primary': col.is_primary
        })
        
    db.commit()
    
    # 3. Create Physical Table
    success, msg = create_physical_table(table.name, cols_data_for_ddl)
    if not success:
        # Rollback meta entries if physical creation fails
        db.delete(db_table)
        db.commit()
        raise HTTPException(status_code=400, detail=msg)
    
    db.refresh(db_table)
    return db_table

@app.get("/tables/", response_model=List[schemas.TableResponse])
def get_tables(db: Session = Depends(get_db)):
    return db.query(models.DynamicTable).all()

# Dynamic Data Endpoints (CRUD)
from sqlalchemy import Table, MetaData, insert, select, update, delete
from fastapi import Request

@app.post("/api/{table_name}")
async def create_record(table_name: str, request: Request, db: Session = Depends(get_db)):
    # Load physical table structure
    meta = MetaData()
    try:
        table = Table(table_name, meta, autoload_with=engine)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Table not found.")
        
    data = await request.json()
    stmt = insert(table).values(**data)
    result = db.execute(stmt)
    db.commit()
    
    return {"message": "Record inserted", "id": result.inserted_primary_key[0]}

@app.get("/api/{table_name}")
def get_records(table_name: str, db: Session = Depends(get_db)):
    meta = MetaData()
    try:
        table = Table(table_name, meta, autoload_with=engine)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Table {table_name} not found.")
        
    stmt = select(table)
    result = db.execute(stmt)
    records = [dict(row._mapping) for row in result.fetchall()]
    return records
