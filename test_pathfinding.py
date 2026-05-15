
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.getcwd())))

from backend.algorithms.pathfinding import Pathfinder

nodes = [
    {"id": "A", "lat": 0, "lng": 0},
    {"id": "B", "lat": 1, "lng": 0},
    {"id": "C", "lat": 0, "lng": 1},
    {"id": "D", "lat": 1, "lng": 1},
]

edges = [
    {"source": "A", "target": "B", "distance": 10, "traffic": 0.9}, # Heavy traffic
    {"source": "A", "target": "C", "distance": 15, "traffic": 0.0}, # No traffic
    {"source": "B", "target": "D", "distance": 10, "traffic": 0.9}, # Heavy traffic
    {"source": "C", "target": "D", "distance": 15, "traffic": 0.0}, # No traffic
]

# A -> B -> D: distance 20, high traffic
# A -> C -> D: distance 30, low traffic

pf = Pathfinder(nodes, edges)

print("Shortest preference:")
res_s = pf.dijkstra("A", "D", "shortest")
print(f"Path: {res_s['path']}, Cost: {res_s['cost']}")

print("\nFastest preference:")
res_f = pf.dijkstra("A", "D", "fastest")
print(f"Path: {res_f['path']}, Cost: {res_f['cost']}")

print("\nLow traffic preference:")
res_l = pf.dijkstra("A", "D", "low_traffic")
print(f"Path: {res_l['path']}, Cost: {res_l['cost']}")
