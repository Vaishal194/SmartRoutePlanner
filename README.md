# Smart Route Planner (AI Navigation System)

This project is an interactive AI-powered Smart Route Planner that demonstrates pathfinding algorithms (Dijkstra, A*, Greedy BFS) using a graph of Karnataka cities.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Cytoscape.js
- **Backend**: FastAPI (Python)

## Features
- Interactive Graph Visualization
- Step-by-step Algorithm Animation
- Real-time Traffic Simulation
- Performance Comparison Analytics

## Setup

### Backend
```bash
pip install fastapi uvicorn pydantic
python -m uvicorn backend.main:app --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
