import json
import requests
import os

JSON_FILE = "scraped_articles.json"
API_URL = "http://localhost:8000/articles/"

def main():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found. Run scraper.py first.")
        return

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        articles = json.load(f)

    print(f"Found {len(articles)} articles. Importing...")

    for article in articles:
        payload = {
            "title": article.get("title"),
            "content": article.get("content"),
            "source_url": article.get("original_url"),
        }
        
        try:
            response = requests.post(API_URL, json=payload)
            if response.status_code == 201:
                print(f"✅ Imported: {payload['title']}")
            else:
                print(f"❌ Failed: {payload['title']} - {response.status_code} {response.text}")
        except Exception as e:
            print(f"❌ Error connecting to API: {e}")

if __name__ == "__main__":
    main()
