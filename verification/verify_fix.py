from playwright.sync_api import sync_playwright

def verify_carousel_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8000/index.html")
            page.wait_for_load_state("networkidle")

            # Scroll to carousel
            empresa = page.locator("#empresa")
            empresa.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)

            # Take screenshot
            carousel_area = page.locator("#empresa section").nth(2)
            carousel_area.screenshot(path="verification/carousel_fixed.png")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_carousel_fix()
