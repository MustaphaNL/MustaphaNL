#!/usr/bin/env python3
"""
Verwijdert alle JudgeMe reviews van een Shopify store.
Vul API_TOKEN en SHOP_DOMAIN in voordat je het script uitvoert.
"""

import urllib.request
import urllib.error
import json
import time

API_TOKEN = "JOUW_API_TOKEN_HIER"       # JudgeMe Settings → API → API Token
SHOP_DOMAIN = "dounyastore.myshopify.com"  # jouw .myshopify.com domein

BASE_URL = "https://judge.me/api/v1"

def api_request(method, path, data=None):
    url = f"{BASE_URL}{path}?api_token={API_TOKEN}&shop_domain={SHOP_DOMAIN}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()}")
        return None

def get_all_reviews():
    reviews = []
    page = 1
    while True:
        url = f"{BASE_URL}/reviews?api_token={API_TOKEN}&shop_domain={SHOP_DOMAIN}&per_page=100&page={page}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        batch = data.get("reviews", [])
        if not batch:
            break
        reviews.extend(batch)
        print(f"  Pagina {page}: {len(batch)} reviews opgehaald")
        page += 1
        time.sleep(0.5)
    return reviews

def delete_review(review_id):
    result = api_request("DELETE", f"/reviews/{review_id}")
    return result is not None

def main():
    print("Reviews ophalen...")
    reviews = get_all_reviews()
    print(f"Totaal gevonden: {len(reviews)} reviews\n")

    if not reviews:
        print("Geen reviews gevonden.")
        return

    deleted = 0
    failed = 0
    for r in reviews:
        rid = r["id"]
        title = r.get("title", "(geen titel)")
        print(f"Verwijderen review #{rid} — {title}...", end=" ")
        if delete_review(rid):
            print("OK")
            deleted += 1
        else:
            print("MISLUKT")
            failed += 1
        time.sleep(0.3)  # rate limiting voorkomen

    print(f"\nKlaar! {deleted} verwijderd, {failed} mislukt.")

if __name__ == "__main__":
    main()
