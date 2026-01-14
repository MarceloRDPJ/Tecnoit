from playwright.sync_api import sync_playwright

def verify_button(page):
    # RDP Mode
    page.goto("http://localhost:8000/projects/relatorio-interativo/index.html")
    page.wait_for_selector("text=Modo TecnoIT")
    # Take screenshot of the header area where the button is
    # The header is roughly the first 100px
    page.screenshot(path="verification_button.png", clip={"x":0, "y":0, "width": 1280, "height": 100})

def verify_tecnoit_logo(page):
    # TecnoIT Mode
    page.goto("http://localhost:8000/projects/relatorio-interativo/tecnoit.html")
    # Wait for logo to load
    page.wait_for_selector("img[alt='Logo TecnoIT']")
    page.screenshot(path="verification_tecnoit_header.png", clip={"x":0, "y":0, "width": 1280, "height": 100})

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            verify_button(page)
            verify_tecnoit_logo(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
