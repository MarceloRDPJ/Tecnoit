from playwright.sync_api import sync_playwright

def verify_new_menu():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # iPhone 12 Pro viewport
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()

        # 1. Verify Hub Menu
        print("Checking Hub Menu...")
        page.goto("http://localhost:8000/index.html")
        menu_btn = page.locator("#mobile-menu-btn")

        # Open
        menu_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/hub_menu_open.png")

        # Verify Aria
        is_hidden = page.locator("#mobile-menu-overlay").get_attribute("aria-hidden")
        print(f"Hub Menu Aria-Hidden (Open): {is_hidden}")

        # Verify Icon Change (class contains fa-xmark)
        icon_class = menu_btn.locator("i").get_attribute("class")
        print(f"Hub Icon Class (Open): {icon_class}")

        # Close
        menu_btn.click()
        page.wait_for_timeout(500)

        # 2. Verify React Scanner Menu
        print("Checking Scanner Menu...")
        page.goto("http://localhost:8000/projects/scanner-game-free/index.html")
        page.wait_for_timeout(2000) # React load

        menu_btn_react = page.locator("#mobile-menu-btn") # The button inside Header component
        # Note: In React we passed the prop to the Header, let's make sure ID is on the button in JSX
        # Looking at my code: <button onClick={onMenuClick} className="md:hidden..." aria-label="Abrir Menu">
        # I removed the ID in the React component? No, wait.
        # In my edit: <button onClick={onMenuClick} className="md:hidden... ml-auto" aria-label="Abrir Menu">
        # I removed `id="mobile-menu-btn"`. I should fix the test selector or check if I need the ID.
        # The user's snippet HAD the ID.
        # My edit for `scanner-game-free` had:
        # <button onClick={onMenuClick} className="md:hidden text-white text-2xl p-2 z-50 relative group ml-auto" aria-label="Abrir Menu">
        # I did NOT include the ID in the React component button in the `replace_with_git_merge_diff`.
        # I should use aria-label locator.

        menu_btn_react = page.get_by_label("Abrir Menu")
        menu_btn_react.click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/scanner_menu_open.png")

        # Verify Icon (React logic switches class)
        icon_react = menu_btn_react.locator("i")
        icon_class_react = icon_react.get_attribute("class")
        print(f"Scanner Icon Class (Open): {icon_class_react}")

        browser.close()

if __name__ == "__main__":
    verify_new_menu()
