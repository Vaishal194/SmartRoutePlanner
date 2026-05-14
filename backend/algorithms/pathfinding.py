import math
import heapq
import time

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class Pathfinder:
    def __init__(self, nodes, edges):
        self.nodes = {node['id']: node for node in nodes}
        self.adj = {node['id']: [] for node in nodes}
        for edge in edges:
            self.adj[edge['source']].append(edge)
            # Ensure bidirectional
            rev = {**edge, "source": edge["target"], "target": edge["source"]}
            self.adj[edge['target']].append(rev)

    def get_weight(self, edge, preference):
        dist = edge['distance']
        traffic = edge.get('traffic', 0)
        if preference == "fastest":
            return dist * (1 + traffic * 2)
        if preference == "low_traffic":
            return dist * (1 + traffic * 5)
        return dist

    def run_algorithm(self, algo_name, start_node, end_node, preference="shortest"):
        start_time = time.time()
        
        if algo_name == "dijkstra":
            res = self.dijkstra(start_node, end_node, preference)
        elif algo_name == "astar":
            res = self.a_star(start_node, end_node, preference)
        elif algo_name == "greedy":
            res = self.greedy(start_node, end_node)
        else:
            return None
            
        exec_time = (time.time() - start_time) * 1000
        res["execution_time"] = exec_time
        res["algorithm"] = algo_name
        return res

    def dijkstra(self, start_node, end_node, preference="shortest"):
        pq = [(0, start_node, [], [])] # cost, current, path, edges_path
        visited = {}
        steps = []
        visited_order = []
        
        while pq:
            cost, current, path, e_path = heapq.heappop(pq)
            
            if current in visited and visited[current] <= cost:
                continue
            
            visited[current] = cost
            new_path = path + [current]
            visited_order.append(current)
            
            steps.append({
                "node": current,
                "cost": cost,
                "frontier": [item[1] for item in pq]
            })
            
            if current == end_node:
                return {
                    "path": new_path,
                    "cost": cost,
                    "steps": steps,
                    "visited_order": visited_order,
                    "nodes_explored": len(visited_order)
                }
            
            for edge in self.adj[current]:
                neighbor = edge['target']
                weight = self.get_weight(edge, preference)
                heapq.heappush(pq, (cost + weight, neighbor, new_path, e_path + [edge]))
        
        return {"path": [], "cost": 0, "steps": steps, "visited_order": visited_order, "nodes_explored": len(visited_order)}

    def a_star(self, start_node, end_node, preference="shortest"):
        target = self.nodes[end_node]
        pq = [(0, 0, start_node, [])] # f, g, current, path
        visited = {}
        steps = []
        visited_order = []
        
        while pq:
            f, g, current, path = heapq.heappop(pq)
            
            if current in visited and visited[current] <= g:
                continue
            
            visited[current] = g
            new_path = path + [current]
            visited_order.append(current)
            
            steps.append({
                "node": current,
                "f": f,
                "g": g,
                "frontier": [item[2] for item in pq]
            })
            
            if current == end_node:
                return {
                    "path": new_path,
                    "cost": g,
                    "steps": steps,
                    "visited_order": visited_order,
                    "nodes_explored": len(visited_order)
                }
            
            for edge in self.adj[current]:
                neighbor = edge['target']
                weight = self.get_weight(edge, preference)
                new_g = g + weight
                n = self.nodes[neighbor]
                h = haversine(n['lat'], n['lng'], target['lat'], target['lng'])
                heapq.heappush(pq, (new_g + h, new_g, neighbor, new_path))
                
        return {"path": [], "cost": 0, "steps": steps, "visited_order": visited_order, "nodes_explored": len(visited_order)}

    def greedy(self, start_node, end_node):
        target = self.nodes[end_node]
        pq = [(0, start_node, [])] # h, current, path
        visited = set()
        steps = []
        visited_order = []
        
        while pq:
            h, current, path = heapq.heappop(pq)
            
            if current in visited:
                continue
                
            visited.add(current)
            new_path = path + [current]
            visited_order.append(current)
            
            steps.append({
                "node": current,
                "h": h,
                "frontier": [item[1] for item in pq]
            })
            
            if current == end_node:
                # Calculate real cost for greedy path
                real_cost = 0
                for i in range(len(new_path)-1):
                    edges = self.adj[new_path[i]]
                    edge = next(e for e in edges if e['target'] == new_path[i+1])
                    real_cost += edge['distance']
                return {
                    "path": new_path,
                    "cost": real_cost,
                    "steps": steps,
                    "visited_order": visited_order,
                    "nodes_explored": len(visited_order)
                }
            
            for edge in self.adj[current]:
                neighbor = edge['target']
                if neighbor not in visited:
                    n = self.nodes[neighbor]
                    new_h = haversine(n['lat'], n['lng'], target['lat'], target['lng'])
                    heapq.heappush(pq, (new_h, neighbor, new_path))
                    
        return {"path": [], "cost": 0, "steps": steps, "visited_order": visited_order, "nodes_explored": len(visited_order)}
