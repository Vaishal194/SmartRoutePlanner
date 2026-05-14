def binary_search_city(cities, target_name):
    """
    cities: list of dictionaries with 'id' key
    target_name: string to search for
    """
    # Sort cities by ID first (should be done once ideally)
    sorted_cities = sorted(cities, key=lambda x: x['id'])
    
    low = 0
    high = len(sorted_cities) - 1
    
    steps = []
    
    while low <= high:
        mid = (low + high) // 2
        mid_val = sorted_cities[mid]['id']
        
        steps.append({"low": low, "high": high, "mid": mid, "val": mid_val})
        
        if mid_val == target_name:
            return sorted_cities[mid], steps
        elif mid_val < target_name:
            low = mid + 1
        else:
            high = mid - 1
            
    return None, steps

def binary_search_history(history, target_key):
    """
    history: list of route objects sorted by target_key
    target_key: e.g. "Bengaluru-Mysuru"
    """
    low = 0
    high = len(history) - 1
    
    while low <= high:
        mid = (low + high) // 2
        mid_val = history[mid]['key']
        
        if mid_val == target_key:
            return history[mid]
        elif mid_val < target_key:
            low = mid + 1
        else:
            high = mid - 1
            
    return None
