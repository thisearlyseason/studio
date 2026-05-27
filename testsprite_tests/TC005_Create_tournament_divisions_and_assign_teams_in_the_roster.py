import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()
        # -> navigate
        await page.goto("http://localhost:9002")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Navigate to the login page at /login and check for the sign-in form fields.
        await page.goto("http://localhost:9002/login")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the email and password fields with default credentials and submit the login form.
        # email input placeholder="name@organization.com"
        elem = page.locator("xpath=/html/body/div[2]/div[5]/div/form/div/div[2]/input").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("example@gmail.com")
        
        # -> Fill the email and password fields with default credentials and submit the login form.
        # password input
        elem = page.locator("xpath=/html/body/div[2]/div[5]/div/form/div/div[3]/div[2]/input").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("password123")
        
        # -> Fill the email and password fields with default credentials and submit the login form.
        # button "Verify Identity"
        elem = page.locator("xpath=/html/body/div[2]/div[5]/div/form/div[2]/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # Wait for redirect/session initialization to finish
        await page.wait_for_timeout(3000)
        
        # -> Navigate directly to /manage-tournaments to check whether the tournament management UI is accessible (or whether login is required).
        await page.goto("http://localhost:9002/manage-tournaments")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Launch Hub' button for the tournament to open the tournament management view.
        elem = page.locator("button:has-text('Launch Hub')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the Architecture tab to open the Architecture view.
        elem = page.locator("button:has-text('Architecture')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Add a new division by entering the name into input and clicking the Add Division button.
        elem = page.locator("input[placeholder='New Division Name...']").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TC005 Division")
        
        elem = page.locator("button:has-text('Add Division')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Open the Roster tab so roster assignment controls become visible and teams can be assigned.
        elem = page.locator("button:has-text('Roster')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the division dropdown for the first team.
        elem = page.locator("button[role='combobox']").nth(0)
        if not await elem.is_visible():
            elem = page.locator("button:has-text('No Division')").nth(0)
        if not await elem.is_visible():
            elem = page.locator("button:has-text('Division')").nth(0)
            
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Select 'TC005 Division' from the options.
        elem = page.locator("[role='option']:has-text('TC005 Division')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the Architecture tab to switch views and verify division organization is displayed.
        elem = page.locator("button:has-text('Architecture')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Verify that 'TC005 Division' is displayed in the list of divisions.
        await expect(page.locator("text=TC005 Division").nth(0)).to_be_visible()
        
        # -> Go back to Roster tab to verify.
        elem = page.locator("button:has-text('Roster')").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Verify that the division assignment for the first team is now 'TC005 Division'.
        await expect(page.locator("button:has-text('TC005 Division')").nth(0)).to_be_visible()
        
        # Assert success
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert current_url is not None, "Test completed successfully"
        await asyncio.sleep(5)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    