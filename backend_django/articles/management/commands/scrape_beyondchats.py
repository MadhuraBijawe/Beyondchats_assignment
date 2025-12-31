from django.core.management.base import BaseCommand
import requests
from bs4 import BeautifulSoup
from articles.models import Article
from urllib.parse import urljoin

BASE = 'https://beyondchats.com'
BLOGS = 'https://beyondchats.com/blogs/'

SELECTORS = [
    'article',
    'main',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content',
]


def extract_main_content(soup):
    # Try common containers
    for sel in SELECTORS:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True) and len(el.get_text(strip=True)) > 200:
            return str(el)
    # Fallback: use all paragraphs
    ps = soup.find_all('p')
    if ps:
        return '\n'.join([str(p) for p in ps])
    return soup.get_text(separator='\n')


class Command(BaseCommand):
    help = 'Scrape the BeyondChats blogs and import the 5 oldest articles (last page)'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5, help='How many oldest articles to fetch')

    def handle(self, *args, **options):
        cnt = options.get('count', 5)
        self.stdout.write(f'Fetching blog index: {BLOGS}')
        r = requests.get(BLOGS, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')

        # Find pagination last page link if present
        last_page_url = None
        # Look for rel="last" or pagination links
        rel_last = soup.select_one('a[rel="last"]')
        if rel_last and rel_last.get('href'):
            last_page_url = urljoin(BASE, rel_last['href'])
        else:
            # try to find pagination links and pick the highest page number
            pages = []
            for a in soup.select('a'):
                href = a.get('href')
                if not href:
                    continue
                if '/blogs?page=' in href or '?page=' in href:
                    try:
                        # extract page number
                        import re
                        m = re.search(r'[?&]page=(\d+)', href)
                        if m:
                            pages.append((int(m.group(1)), urljoin(BASE, href)))
                    except Exception:
                        pass
            if pages:
                pages.sort()
                last_page_url = pages[-1][1]

        if not last_page_url:
            # Fallback: treat the current blogs page as last
            last_page_url = BLOGS

        self.stdout.write(f'Using last page: {last_page_url}')
        r2 = requests.get(last_page_url, timeout=15)
        r2.raise_for_status()
        soup2 = BeautifulSoup(r2.text, 'html.parser')

        # Find article links on the last page
        links = []
        # common patterns: .post a[href], h2 a, article a
        for sel in ['article a[href]', 'h2 a[href]', '.post a[href]', 'a[href*="/blogs/"]']:
            for a in soup2.select(sel):
                href = a.get('href')
                if href:
                    full = urljoin(BASE, href)
                    if full not in links:
                        links.append(full)
        # limit to count
        links = links[:cnt]

        if not links:
            self.stdout.write('No article links found on last page.')
            return

        created = 0
        for link in links:
            try:
                self.stdout.write(f'Fetching article: {link}')
                ar = requests.get(link, timeout=15)
                ar.raise_for_status()
                s = BeautifulSoup(ar.text, 'html.parser')
                # title
                title_tag = s.find('title')
                title = title_tag.get_text(strip=True) if title_tag else s.find('h1').get_text(strip=True) if s.find('h1') else link
                content_html = extract_main_content(s)
                # avoid duplicates by source_url
                if Article.objects.filter(source_url=link).exists():
                    self.stdout.write(f'Article already exists in DB: {link}')
                    continue
                Article.objects.create(title=title, content=content_html, source_url=link)
                created += 1
                self.stdout.write(self.style.SUCCESS(f'Created article: {title}'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Failed to fetch {link}: {e}'))
        self.stdout.write(self.style.SUCCESS(f'Done. Created {created} new articles.'))
