from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the project page
            page.goto("http://localhost:8000/projects/scanner-game-free/index.html")

            # Wait for data to load (looking for specific elements)
            page.wait_for_selector("text=Feed de Inteligência")
            page.wait_for_selector("text=RDP INSIDER")

            # Take a screenshot of the Hero section and Top Grid
            page.screenshot(path="verification/scanner_preview.png", full_page=True)
            print("Screenshot taken successfully.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
