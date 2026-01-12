from playwright.sync_api import sync_playwright, expect

def verify_projetos_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the projetos page served locally
        page.goto("http://localhost:8000/hub/projetos.html")

        # Wait for content to load and animations to settle
        page.wait_for_timeout(2000)

        # Verify Header Logo
        expect(page.get_by_alt_text("Logo")).to_be_visible()

        # Verify Hero Text (Marketing Copy)
        expect(page.get_by_text("Não apenas código.")).to_be_visible()
        expect(page.get_by_text("Soluções de Negócio.")).to_be_visible()

        # Verify Cards exist
        # RDP Insider
        expect(page.get_by_text("RDP Insider")).to_be_visible()
        # Validador Fortigate
        expect(page.get_by_text("Validador Fortigate")).to_be_visible()
        # GLPI Automator
        expect(page.get_by_text("GLPI Automator")).to_be_visible()
        # Sales AI Agent
        expect(page.get_by_text("Sales AI Agent")).to_be_visible()

        # Take a screenshot
        screenshot_path = "verification/projetos_page_verification.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_projetos_page()
