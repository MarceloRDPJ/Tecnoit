from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            # Navigate to the local server
            page.goto("http://localhost:8000/projects/scanner-game-free/index.html")

            # Wait for any text that indicates the app loaded
            page.wait_for_selector("text=RDP INSIDER", timeout=10000)

            # Take a screenshot of the main dashboard
            page.screenshot(path="/home/jules/verification/verification.png", full_page=True)
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
