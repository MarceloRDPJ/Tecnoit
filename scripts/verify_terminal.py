import asyncio
from playwright.async_api import async_playwright
import sys

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        url = "http://localhost:8000/hub/index.html"
        print(f"Navigating to {url}")

        try:
            await page.goto(url)
        except Exception as e:
            print(f"Failed to navigate: {e}")
            await browser.close()
            return

        # Check Terminal Body
        print("Checking Terminal Body...")
        if await page.is_visible("#terminal-body"):
            print("SUCCESS: Terminal body visible.")
        else:
            print("FAILURE: Terminal body NOT visible.")
            await browser.close()
            sys.exit(1)

        # Wait for typewriter to start (it has 1500ms delay)
        print("Waiting for typewriter effect...")
        await page.wait_for_timeout(3000)

        content = await page.inner_text("#typewriter-content")
        print(f"Content length: {len(content)}")
        if len(content) > 0:
            print("SUCCESS: Typewriter content detected.")
        else:
            print("FAILURE: Typewriter content empty.")
            await page.screenshot(path="terminal_fail.png")
            await browser.close()
            sys.exit(1)

        await browser.close()
        print("Verification PASSED.")

if __name__ == "__main__":
    asyncio.run(run())
