import httpx
import base64
import os
import urllib.parse

API_KEY = os.getenv("ROBOFLOW_API_KEY", "")
ROBOFLOW_MODEL_ID = os.getenv("ROBOFLOW_DETECTION_MODEL_ID", "pothole-detection/1")
ROBOFLOW_URL = f"https://detect.roboflow.com/{ROBOFLOW_MODEL_ID}?api_key={API_KEY}"

def get_wikimedia_commons_images(query="pothole road", limit=15):
    search_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit={limit}&prop=imageinfo&iiprop=url&format=json"
    headers = {"User-Agent": "CivoAITestBot/1.0 (contact@civoai.gov)"}
    resp = httpx.get(search_url, headers=headers, follow_redirects=True)
    data = resp.json()
    urls = []
    if 'query' in data and 'pages' in data['query']:
        pages = data['query']['pages']
        for p_id in pages:
            imageinfo = pages[p_id].get('imageinfo', [])
            if imageinfo:
                url = imageinfo[0]['url']
                if url.lower().endswith(('.jpg', '.jpeg')):
                    urls.append(url)
    return urls

def main():
    print("Searching Wikimedia Commons for pothole images...")
    urls = get_wikimedia_commons_images("pothole", limit=20)
    
    if not urls:
        print("Failed to retrieve images. Please check network connection.")
        return

    for url in urls:
        print(f"Testing image: {url}")
        try:
            # Download image
            img_resp = httpx.get(url, follow_redirects=True)
            if img_resp.status_code != 200:
                print(f"Failed to download {url}")
                continue
            
            img_data = img_resp.content
            
            # Post to Roboflow API using base64
            image_b64 = base64.b64encode(img_data).decode('utf-8')
            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            res = httpx.post(ROBOFLOW_URL, data=image_b64, headers=headers, timeout=15.0)
            
            if res.status_code != 200:
                print(f"Roboflow API error: {res.text}")
                continue
                
            predictions = res.json().get('predictions', [])
            print(f"Predictions: {[p['class'] for p in predictions]}")
            
            success = False
            for p in predictions:
                if p['class'] in ['pothole', 'potholes']:
                    success = True
                    break
                    
            if success:
                print(f"Success! Image classified as pothole.")
                save_path = "d:/code_placed/civoAI/scripts/successful_pothole.jpg"
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                with open(save_path, "wb") as f:
                    f.write(img_data)
                print(f"Successfully saved to {save_path}")
                return
        except Exception as e:
            print(f"Error testing {url}: {e}")
            
    print("Could not find a successful image among the ones tested.")

if __name__ == '__main__':
    main()
