from playwright.sync_api import sync_playwright

def verify_hub_structure():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Test Root Redirection
        print("Testing Root Redirection...")
        # Note: In a real server, http://localhost:8000/ would redirect.
        # Here we test if the file exists and has the redirect logic,
        # but better to test the target page directly to verify links.

        # 2. Test Hub Home
        url = "http://localhost:8000/hub/index.html"
        print(f"Navigating to {url}")
        page.goto(url)

        # Verify Title
        if "RDP STUDIO" in page.title():
             print("SUCCESS: Hub Title Verified")

        # Verify Asset Loading (Logo)
        # The src should be "../assets/images/branding/logo.png"
        logo = page.locator("img[alt='Logo']")
        if logo.count() > 0:
             src = logo.first.get_attribute("src")
             if "../assets" in src:
                 print(f"SUCCESS: Logo src is relative: {src}")
             else:
                 print(f"WARNING: Logo src might be wrong: {src}")

        # 3. Test Navigation to Projects
        print("Testing Navigation to Projects...")
        # Click on 'Projetos' link
        page.get_by_text("Projetos", exact=True).first.click()
        page.wait_for_load_state()

        if "projetos.html" in page.url:
            print("SUCCESS: Navigated to Projects Page")
        else:
             print(f"FAILURE: Navigation failed, url is {page.url}")

        # 4. Test Back to Hub from a Project (Mock navigation)
        # We go to a project page and check the link
        print("Testing Project Back Link...")
        page.goto("http://localhost:8000/projects/validador-firewall/index.html")

        back_link = page.locator("a:has-text('Voltar ao Hub')")
        if back_link.count() > 0:
            href = back_link.get_attribute("href")
            if "../../hub/index.html" in href:
                 print(f"SUCCESS: Back link is correct: {href}")
            else:
                 print(f"FAILURE: Back link is incorrect: {href}")
        else:
             print("FAILURE: 'Voltar ao Hub' link not found")

        # Screenshot
        page.goto("http://localhost:8000/hub/index.html")
        page.screenshot(path="verification/hub_final.png")
        print("Screenshot saved to verification/hub_final.png")

        browser.close()

if __name__ == "__main__":
    verify_hub_structure()
