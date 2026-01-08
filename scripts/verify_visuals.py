
import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_footers():
    # Start a simple HTTP server to serve the files
    # We will just use file:// protocol for simplicity as these are static files
    # But wait, local files might have issues with some assets or CORS if not served.
    # However, the user mentioned: "Playwright verification for projects fetching local JSON (like RDP Insider) requires running a local HTTP server"
    # So we should run a server.

    # We can assume the server is running on port 8000 from previous context or start one.
    # Let's try to access via localhost:8000 assuming the user or previous step started it.
    # Or we can just use file path for now since we are just checking footer visuals which are static HTML mostly.
    # React app (scanner-game-free) might need server.

    base_path = os.getcwd()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Check Hub Home
        page = browser.new_page()
        # Use http://localhost:8000 if server is running, else file://
        # Let's try file first for robust paths
        page.goto(f"file://{base_path}/hub/index.html")
        time.sleep(1) # Wait for render
        page.locator("footer").screenshot(path="footer_hub_home.png")
        print("Captured footer_hub_home.png")

        # Check Hub Projects
        page.goto(f"file://{base_path}/hub/projetos.html")
        time.sleep(1)
        page.locator("footer").screenshot(path="footer_hub_projects.png")
        print("Captured footer_hub_projects.png")

        # Check Sub-project: GLPI
        page.goto(f"file://{base_path}/projects/abertura-chamados-glpi/index.html")
        time.sleep(1)
        page.locator("footer").screenshot(path="footer_glpi.png")
        print("Captured footer_glpi.png")

        # Check Sub-project: Validador
        page.goto(f"file://{base_path}/projects/validador-firewall/index.html")
        time.sleep(1)
        page.locator("footer").screenshot(path="footer_validador.png")
        print("Captured footer_validador.png")

        # Check Sub-project: Scanner (React) - This needs Babel/JS execution
        # React might complain about cross-origin on file:// for loading scripts
        # We really need the server for this one.
        # Let's try to access via localhost:8000 assuming it's up.
        # If not, we might fail.
        try:
             page.goto("http://localhost:8000/projects/scanner-game-free/index.html")
             page.wait_for_selector("footer", timeout=5000)
             page.locator("footer").screenshot(path="footer_scanner.png")
             print("Captured footer_scanner.png via localhost")
        except Exception as e:
             print(f"Could not capture scanner footer via localhost: {e}")
             # Fallback to file:// which might fail loading modules
             # But this project uses babel-standalone in script tags, it might work if no external fetches are blocked.
             try:
                page.goto(f"file://{base_path}/projects/scanner-game-free/index.html")
                page.wait_for_selector("footer", timeout=5000)
                page.locator("footer").screenshot(path="footer_scanner_file.png")
                print("Captured footer_scanner_file.png")
             except Exception as e2:
                 print(f"Failed via file:// too: {e2}")

        browser.close()

if __name__ == "__main__":
    verify_footers()
