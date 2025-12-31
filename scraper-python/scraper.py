import requests
from bs4 import BeautifulSoup
import json

URL = "https://beyondchats.com/blogs/"

response = requests.get(URL)
soup = BeautifulSoup(response.text, "lxml")

articles = soup.select("article")
oldest_articles = articles[-5:]

scraped_data = []

for article in oldest_articles:
    title = article.find("h2").get_text(strip=True)
    link = article.find("a")["href"]

    article_res = requests.get(link)
    article_soup = BeautifulSoup(article_res.text, "lxml")

    # CONTENT
    content_div = article_soup.find("div", class_="elementor-widget-theme-post-content")
    content = content_div.get_text("\n", strip=True) if content_div else ""

    # AUTHOR (safe)
    author_tag = article_soup.find("span", class_="author")
    author = author_tag.get_text(strip=True) if author_tag else "BeyondChats"

    # DATE
    date_tag = article_soup.find("time")
    published_date = date_tag.get_text(strip=True) if date_tag else ""

    scraped_data.append({
        "title": title,
        "author": author,
        "published_date": published_date,
        "content": content,
        "original_url": link,
        "tags": []
    })

# SAVE TO JSON
with open("scraped_articles.json", "w", encoding="utf-8") as f:
    json.dump(scraped_data, f, ensure_ascii=False, indent=2)

print("✅ Articles saved to scraped_articles.json")
