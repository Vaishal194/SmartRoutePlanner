from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import time
import random
from typing import List, Dict
from backend.models.models import GraphData, RouteRequest, RouteResponse
from backend.algorithms.pathfinding import Pathfinder
from backend.algorithms.binary_search import binary_search_city, binary_search_history

app = FastAPI(title="Smart Route Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
with open("backend/data/graph_data.json", "r") as f:
    graph_raw = json.load(f)

current_graph = graph_raw
history = []

def update_traffic():
    for edge in current_graph["edges"]:
        # Random traffic between 0 and 0.9
        edge["traffic"] = round(random.uniform(0, 0.9), 2)
        # travel_time = distance * (1 + traffic)
        edge["travel_time"] = round(edge["distance"] * (1 + edge["traffic"]), 2)

update_traffic()

@app.get("/graph")
async def get_graph():
    return current_graph

@app.get("/traffic")
async def get_traffic():
    update_traffic()
    return current_graph["edges"]

@app.post("/route/dijkstra")
async def dijkstra_route(req: RouteRequest):
    pf = Pathfinder(current_graph["nodes"], current_graph["edges"])
    start_time = time.time()
    result = pf.dijkstra(req.source, req.destination, req.preference)
    exec_time = (time.time() - start_time) * 1000
    
    if not result:
        raise HTTPException(status_code=404, detail="Path not found")
    
    response = {**result, "execution_time": exec_time}
    save_to_history(req.source, req.destination, "Dijkstra", response)
    return response

@app.post("/route/astar")
async def astar_route(req: RouteRequest):
    pf = Pathfinder(current_graph["nodes"], current_graph["edges"])
    start_time = time.time()
    result = pf.a_star(req.source, req.destination, req.preference)
    exec_time = (time.time() - start_time) * 1000
    
    if not result:
        raise HTTPException(status_code=404, detail="Path not found")
    
    response = {**result, "execution_time": exec_time}
    save_to_history(req.source, req.destination, "A*", response)
    return response

@app.post("/route/greedy")
async def greedy_route(req: RouteRequest):
    pf = Pathfinder(current_graph["nodes"], current_graph["edges"])
    start_time = time.time()
    result = pf.greedy(req.source, req.destination)
    exec_time = (time.time() - start_time) * 1000
    
    if not result:
        raise HTTPException(status_code=404, detail="Path not found")
    
    response = {**result, "execution_time": exec_time}
    save_to_history(req.source, req.destination, "Greedy", response)
    return response

@app.post("/route/race")
async def race_route(req: RouteRequest):
    pf = Pathfinder(current_graph["nodes"], current_graph["edges"])
    results = {}
    for algo in ["dijkstra", "astar", "greedy"]:
        results[algo] = pf.run_algorithm(algo, req.source, req.destination, req.preference)
    return results

@app.get("/search/city/{name}")
async def search_city(name: str):
    res, steps = binary_search_city(current_graph["nodes"], name)
    if not res:
        return {"found": False, "steps": steps}
    return {"found": True, "city": res, "steps": steps}

def save_to_history(source, dest, algo, result):
    key = f"{source}-{dest}"
    history.append({
        "key": key,
        "algo": algo,
        "path": result["path"],
        "cost": result["cost"],
        "nodes_explored": result["nodes_explored"],
        "execution_time": result["execution_time"],
        "timestamp": time.time()
    })
    history.sort(key=lambda x: x["key"])

@app.get("/history")
async def get_all_history():
    return history

@app.get("/history/{key}")
async def get_history(key: str):
    res = binary_search_history(history, key)
    if not res:
        raise HTTPException(status_code=404, detail="History not found")
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
