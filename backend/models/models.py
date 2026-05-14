from pydantic import BaseModel
from typing import List, Optional, Dict

class Node(BaseModel):
    id: str
    lat: float
    lng: float

class Edge(BaseModel):
    source: str
    target: str
    distance: float
    traffic: Optional[float] = 0.0
    travel_time: Optional[float] = 0.0

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class RouteRequest(BaseModel):
    source: str
    destination: str
    preference: str = "shortest"

class Step(BaseModel):
    type: str
    node: str
    cost: Optional[float] = None
    g: Optional[float] = None
    f: Optional[float] = None
    h: Optional[float] = None
    frontier: List[str]

class RouteResponse(BaseModel):
    path: List[str]
    cost: float
    steps: List[Dict]
    nodes_explored: int
    execution_time: float
