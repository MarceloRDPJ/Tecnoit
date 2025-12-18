import json
import urllib.request
import urllib.error
import datetime
import re
import os
import random

# Configuration
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'db.json')

SOURCES = [
    {
        "name": "r/GamingLeaksAndRumours",
        "url": "https://www.reddit.com/r/GamingLeaksAndRumours/hot.json?limit=25",
        "type": "rumor"
    },
    {
        "name": "r/FreeGameFindings",
        "url": "https://www.reddit.com/r/FreeGameFindings/hot.json?limit=15",
        "type": "freebie"
    },
    {
        "name": "r/Hardware",
        "url": "https://www.reddit.com/r/hardware/search.json?q=rumor&restrict_sr=1&sort=new&limit=10",
        "type": "hardware"
    }
]

# Fallback Data (used if network fails or API blocks)
FALLBACK_DATA = [
    {
        "id": "mock_001",
        "title": "GTA VI: Map Size Comparison Leaked via Artist Profile",
        "image": "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1978&auto=format&fit=crop",
        "source_count": 12,
        "reliability": "High",
        "category": "Rumor",
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "summary": "Multiple sources confirm the map size is approximately 2.5x larger than Los Santos, including new island areas.",
        "sources": ["r/GamingLeaksAndRumours", "InsiderGaming", "Twitter @Leaker123"]
    },
    {
        "id": "mock_002",
        "title": "Epic Games Mystery Game 5: The Outer Worlds (Spacer's Choice Edition)",
        "image": "https://images.unsplash.com/photo-1627856014759-08529612289d?q=80&w=2070&auto=format&fit=crop",
        "source_count": 45,
        "reliability": "Confirmed",
        "category": "Free Games",
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "summary": "Data mining of the Epic Store launcher confirms the next wrapper matches The Outer Worlds color scheme.",
        "sources": ["r/EpicGamesPC", "Billbil-kun"]
    },
    {
        "id": "mock_003",
        "title": "Nintendo Switch 2: 8-inch LCD Screen Confirmed by Supply Chain",
        "image": "https://images.unsplash.com/photo-1578303512597-8198dd382374?q=80&w=2069&auto=format&fit=crop",
        "source_count": 8,
        "reliability": "Medium",
        "category": "Hardware",
        "date": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        "summary": "Reports from Sharp indicate mass production of 8-inch LCD panels destined for a 'major Japanese console'.",
        "sources": ["Bloomberg", "r/NintendoSwitch"]
    },
    {
        "id": "mock_004",
        "title": "Bloodborne PC Port: Project 'Velvet Veil' spotted in database",
        "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        "source_count": 3,
        "reliability": "Low",
        "category": "Rumor",
        "date": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
        "summary": "A reliable dataminer found references to a Sony project that aligns with Bloodborne asset naming conventions.",
        "sources": ["4chan", "r/GamingLeaksAndRumours"]
    },
     {
        "id": "mock_005",
        "title": "RTX 5090 Specs: 32GB GDDR7 Memory and 70% Performance Uplift",
        "image": "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=2070&auto=format&fit=crop",
        "source_count": 15,
        "reliability": "Medium",
        "category": "Hardware",
        "date": (datetime.datetime.now() - datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
        "summary": "Kopite7kimi leaks suggest the Blackwell architecture will feature a massive bandwidth increase.",
        "sources": ["r/Nvidia", "Videocardz"]
    }
]

def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def process_reddit_data(raw_data, category_type):
    if not raw_data or 'data' not in raw_data or 'children' not in raw_data['data']:
        return []

    items = []
    for child in raw_data['data']['children']:
        data = child['data']

        # Filter sticky posts if needed, but sometimes they are useful megathreads
        if data.get('stickied') and data.get('num_comments') < 50:
            continue

        # Reliability Calc
        score = data.get('score', 0)
        comments = data.get('num_comments', 0)

        reliability = "Low"
        if score > 500 or comments > 100: reliability = "Medium"
        if score > 2000 or comments > 500: reliability = "High"

        # Image extraction
        image = None
        if 'preview' in data and 'images' in data['preview']:
            image = data['preview']['images'][0]['source']['url'].replace('&amp;', '&')
        elif 'thumbnail' in data and data['thumbnail'].startswith('http'):
            image = data['thumbnail']

        # Fallback image based on category
        if not image or image == 'self' or image == 'default':
            if category_type == 'hardware':
                image = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80"
            elif category_type == 'freebie':
                image = "https://images.unsplash.com/photo-1614166325381-b7348e213446?auto=format&fit=crop&q=80"
            else:
                image = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"

        items.append({
            "id": data['id'],
            "title": data['title'],
            "image": image,
            "source_count": comments, # Using comments as proxy for "discussion volume"
            "reliability": reliability,
            "category": map_category(category_type, data['title']),
            "date": datetime.datetime.fromtimestamp(data['created_utc']).strftime("%Y-%m-%d"),
            "summary": data.get('selftext', '')[:150] + "..." if data.get('selftext') else "Click to read full discussion...",
            "sources": [f"r/{data['subreddit']}"],
            "url": f"https://reddit.com{data['permalink']}"
        })
    return items

def map_category(source_type, title):
    title_lower = title.lower()
    if "nvidia" in title_lower or "amd" in title_lower or "intel" in title_lower or "rtx" in title_lower or "gpu" in title_lower:
        return "Hardware"
    if "free" in title_lower or "giveaway" in title_lower or source_type == 'freebie':
        return "Free Games"
    if "release" in title_lower or "date" in title_lower:
        return "Release Date"
    return "Rumor"

def main():
    print("Starting RDP Intelligence Crawler...")
    all_items = []

    success = False

    # Try fetching real data
    for source in SOURCES:
        print(f"Scanning {source['name']}...")
        data = fetch_json(source['url'])
        if data:
            processed = process_reddit_data(data, source['type'])
            all_items.extend(processed)
            success = True
        else:
            print(f"Failed to scan {source['name']}.")

    # Processing and cross-referencing logic would go here
    # For now, we sort by score/date

    if not success or len(all_items) == 0:
        print("Network scan failed or returned no data. Engaging Protocol B (Using Fallback Data).")
        all_items = FALLBACK_DATA
    else:
        print(f"Successfully scanned {len(all_items)} items from the network.")
        # Sort by date
        all_items.sort(key=lambda x: x['date'], reverse=True)

    # Output Structure
    output = {
        "last_updated": datetime.datetime.now().strftime("%d/%m/%Y %H:%M"),
        "status": "Active",
        "items": all_items
    }

    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print(f"Database updated: {DATA_FILE}")
    except Exception as e:
        print(f"Error saving database: {e}")

if __name__ == "__main__":
    main()
