import json
import urllib.request
import urllib.error
import datetime
import re
import os
import time
import requests
import feedparser
from deep_translator import GoogleTranslator
from bs4 import BeautifulSoup

# Configuration
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'db.json')
EPIC_API_URL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"

# User-Agent to avoid blocks
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

SOURCES = [
    {
        "name": "Eurogamer",
        "url": "https://www.eurogamer.net/feed",
        "type": "rss_news",
        "tags": ["leaks", "rumor", "hardware", "epic", "fortnite", "game", "playstation", "xbox", "pc", "steam", "deal", "free"]
    },
    {
        "name": "r/GamingLeaksAndRumours",
        "url": "https://www.reddit.com/r/GamingLeaksAndRumours/hot.rss",
        "type": "rss_reddit",
        "tags": []
    },
    {
        "name": "r/EpicGamesPC",
        "url": "https://www.reddit.com/r/EpicGamesPC/hot.rss",
        "type": "rss_reddit",
        "tags": []
    },
    {
        "name": "r/FreeGameFindings",
        "url": "https://www.reddit.com/r/FreeGameFindings/hot.rss",
        "type": "rss_reddit",
        "tags": []
    },
    {
        "name": "TechPowerUp",
        "url": "https://www.techpowerup.com/rss/news",
        "type": "rss_hardware",
        "tags": []
    }
]

# Translator Instance
translator = GoogleTranslator(source='auto', target='pt')

def translate_text(text):
    """Translates text to Portuguese using deep_translator with fallback."""
    if not text:
        return ""
    try:
        # Simple caching or limit check could be here
        if len(text) > 4500:
            text = text[:4500]
        return translator.translate(text)
    except Exception as e:
        print(f"Translation Warning: {e}")
        return text

def fetch_content(url):
    """Fetches content with requests and proper headers."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def fetch_epic_free_games():
    """Fetches official free games data from Epic Games Store API."""
    print("Connecting to Epic Games Store API...")
    start_time = time.time()
    try:
        response = requests.get(EPIC_API_URL, timeout=15)
        response.raise_for_status()
        data = response.json()
        latency = (time.time() - start_time) * 1000

        games = data.get('data', {}).get('Catalog', {}).get('searchStore', {}).get('elements', [])

        current_free = []
        upcoming_free = []
        mystery_detected = False

        for game in games:
            promotions = game.get('promotions')
            if not promotions:
                continue

            title = game.get('title')
            description = game.get('description')

            # Find Image
            image_url = ""
            for img in game.get('keyImages', []):
                if img.get('type') == 'OfferImageWide':
                    image_url = img.get('url')
                    break
            if not image_url and game.get('keyImages'):
                image_url = game.get('keyImages')[0].get('url')

            if "Mystery Game" in title or "Voltando em breve" in title:
                mystery_detected = True

            game_data = {
                "title": title,
                "description": description,
                "image": image_url,
                "url": f"https://store.epicgames.com/p/{game.get('urlSlug', '')}" if game.get('urlSlug') else "https://store.epicgames.com/free-games",
                "price": game.get('price', {}).get('totalPrice', {}).get('fmtPrice', {}).get('originalPrice', '0'),
                "start_date": "",
                "end_date": ""
            }

            # Check Current
            promo_offers = promotions.get('promotionalOffers', [])
            if promo_offers and len(promo_offers) > 0:
                offers = promo_offers[0].get('promotionalOffers', [])
                for offer in offers:
                    start_date = offer.get('startDate')
                    end_date = offer.get('endDate')

                    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    if start_date <= now <= end_date:
                        # STRICT CHECK: Price must be 0
                        discount_price = game.get('price', {}).get('totalPrice', {}).get('discountPrice', -1)
                        if discount_price == 0:
                            game_data["start_date"] = start_date
                            game_data["end_date"] = end_date
                            game_data["description"] = translate_text(game_data["description"])
                            current_free.append(game_data)

            # Check Upcoming
            upcoming_offers = promotions.get('upcomingPromotionalOffers', [])
            if upcoming_offers and len(upcoming_offers) > 0:
                offers = upcoming_offers[0].get('promotionalOffers', [])
                for offer in offers:
                    game_data_up = game_data.copy()
                    game_data_up["start_date"] = offer.get('startDate')
                    game_data_up["end_date"] = offer.get('endDate')
                    game_data_up["description"] = translate_text(game_data_up["description"])
                    upcoming_free.append(game_data_up)

        return {
            "status": "Online",
            "latency": f"{int(latency)}ms",
            "current_games": current_free,
            "upcoming_games": upcoming_free,
            "mystery_detected": mystery_detected
        }

    except Exception as e:
        print(f"Error fetching Epic API: {e}")
        return {
            "status": "Offline",
            "latency": "0ms",
            "current_games": [],
            "upcoming_games": [],
            "mystery_detected": False,
            "error": str(e)
        }

def process_rss_feed(source):
    print(f"Scanning RSS: {source['name']}...")
    items = []

    content = fetch_content(source['url'])
    if not content:
        return []

    try:
        feed = feedparser.parse(content)
        if feed.bozo:
             print(f"RSS Parsing Warning {source['name']}: {feed.bozo_exception}")

        for entry in feed.entries[:10]:
            title = entry.title
            link = entry.link

            # Filter by tags if specified
            if source.get('tags') and len(source['tags']) > 0:
                relevant = False
                content_to_check = (title + " " + entry.get('summary', '')).lower()
                for tag in source['tags']:
                    if tag.lower() in content_to_check:
                        relevant = True
                        break
                if not relevant:
                    continue

            # Check if image exists in Reddit content (content usually contains HTML)
            image = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"

            # Helper to find image in HTML content
            def find_image_in_html(html_content):
                if not html_content: return None
                soup = BeautifulSoup(html_content, 'html.parser')
                img = soup.find('img')
                if img and img.get('src'):
                    return img['src']
                return None

            if 'content' in entry:
                 img_candidate = find_image_in_html(entry.content[0].value)
                 if img_candidate: image = img_candidate

            if image == "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80" and 'summary' in entry:
                 img_candidate = find_image_in_html(entry.summary)
                 if img_candidate: image = img_candidate

            # Reddit specific image handling (sometimes in media_thumbnail)
            if 'media_thumbnail' in entry:
                image = entry.media_thumbnail[0]['url']

            # Determine reliability/category
            category = "News"
            if "rumour" in title.lower() or "leak" in title.lower():
                category = "Rumor"
            elif source['type'] == 'rss_hardware':
                category = "Hardware"
            elif "epic" in title.lower():
                category = "Epic News"

            if source['name'] == 'r/FreeGameFindings':
                category = "Free Games"

            # Date
            published = entry.get('published_parsed') or entry.get('updated_parsed')
            date_str = datetime.datetime.now().strftime("%Y-%m-%d")

            try:
                if published:
                    entry_date = datetime.datetime(*published[:6])
                    date_str = entry_date.strftime("%Y-%m-%d")
                    # Age Check (Skip > 48h)
                    if (datetime.datetime.now() - entry_date).days > 2:
                        continue
            except:
                pass

            # Summary cleanup
            summary_text = ""
            if 'summary' in entry:
                soup = BeautifulSoup(entry.summary, "html.parser")
                summary_text = soup.get_text()[:250] + "..."
            elif 'content' in entry:
                 soup = BeautifulSoup(entry.content[0].value, "html.parser")
                 summary_text = soup.get_text()[:250] + "..."

            items.append({
                "id": link,
                "title": translate_text(title),
                "original_title": title,
                "image": image,
                "source_count": 1,
                "reliability": "High" if source['name'] in ["Eurogamer", "TechPowerUp"] else "Medium",
                "category": category,
                "date": date_str,
                "summary": translate_text(summary_text),
                "sources": [source['name']],
                "url": link
            })

    except Exception as e:
        print(f"Error processing RSS {source['name']}: {e}")

    return items

def main():
    print("Starting RDP Intelligence Crawler v3.1...")
    all_items = []

    # 1. Fetch Epic API Data
    epic_data = fetch_epic_free_games()

    # Convert Epic Data to Items for the main feed
    epic_items = []

    # Free Games
    for game in epic_data.get('current_games', []):
        epic_items.append({
            "id": game['url'],
            "title": f"GRÁTIS: {game['title']}",
            "original_title": game['title'],
            "image": game['image'],
            "source_count": 1,
            "reliability": "High",
            "category": "Free Games",
            "date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "summary": game['description'],
            "sources": ["Epic Games Store"],
            "url": game['url']
        })

    # Release Dates (Upcoming)
    for game in epic_data.get('upcoming_games', []):
        start_date_display = ""
        try:
             # Basic ISO parsing
             dt = datetime.datetime.fromisoformat(game['start_date'].replace('Z', '+00:00'))
             start_date_display = dt.strftime('%d/%m')
        except:
             start_date_display = "Em breve"

        epic_items.append({
            "id": game['url'],
            "title": f"EM BREVE: {game['title']}",
            "original_title": game['title'],
            "image": game['image'],
            "source_count": 1,
            "reliability": "High",
            "category": "Release Date",
            "date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "summary": f"Disponível gratuitamente a partir de {start_date_display}. {game['description']}",
            "sources": ["Epic Games Store"],
            "url": game['url']
        })

    all_items.extend(epic_items)

    # 2. Fetch Sources
    failed_sources = 0
    for source in SOURCES:
        try:
            processed = process_rss_feed(source)
            if not processed and source['type'] == 'rss_news':
                 # If news feed returns 0 items, it might be due to tag filtering.
                 print(f"Warning: {source['name']} returned 0 items (strict filtering?).")
            all_items.extend(processed)
        except Exception as e:
             print(f"CRITICAL ERROR scanning {source['name']}: {e}")
             failed_sources += 1

    # Status Determination
    status = "Active"
    if epic_data.get('status') == "Offline":
        status = "Partial Outage"
    if failed_sources == len(SOURCES):
        status = "Offline"
    if len(all_items) == 0 and status != "Offline":
        status = "No Fresh Data"

    # Sort items
    all_items.sort(key=lambda x: x['date'], reverse=True)

    # Output Structure
    output = {
        "last_updated": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "display_date": datetime.datetime.now().strftime("%d/%m/%Y %H:%M"),
        "status": status,
        "epic_data": epic_data,
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
