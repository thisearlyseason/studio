import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        print("Navigating to login...")
        await page.goto("http://localhost:9002/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # Fill credentials
        print("Logging in...")
        # email input placeholder="name@organization.com"
        await page.fill("xpath=/html/body/div[2]/div[5]/div/form/div/div[2]/input", "example@gmail.com")
        await page.fill("xpath=/html/body/div[2]/div[5]/div/form/div/div[3]/div[2]/input", "password123")
        await page.click("xpath=/html/body/div[2]/div[5]/div/form/div[2]/button")
        
        # Wait for navigation
        await page.wait_for_timeout(3000)
        
        print("Navigating to manage-tournaments...")
        await page.goto("http://localhost:9002/manage-tournaments")
        await page.wait_for_timeout(5000) # Give it time to load from Firestore
        
        url = page.url
        print(f"Current URL: {url}")
        
        # Capture screenshot
        await page.screenshot(path="scratch/tournaments_debug.png")
        print("Screenshot saved to scratch/tournaments_debug.png")
        
        # Check for buttons
        buttons = await page.locator("button").all_text_contents()
        print("Buttons found on page:", buttons)
        
        # Print page text
        text = await page.locator("body").text_content()
        print("Body text snippet:", text[:2000] if text else "None")
        
        await context.close()
        await browser.close()

asyncio.run(debug())
