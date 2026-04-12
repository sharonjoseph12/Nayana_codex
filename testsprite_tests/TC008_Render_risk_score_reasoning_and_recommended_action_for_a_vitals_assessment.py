import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5173
        await page.goto("http://localhost:5173")
        
        # -> Fill the 6 registration fields (name='Explainability', age=38, condition='ALS Stage 2', room='ICU-7', caregiver='Dr. Priya Sharma', phone='+919999999999') and scroll down to reveal the Start Session button.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Explainability')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('38')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div[3]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('ALS Stage 2')
        
        # -> Fill all 6 registration fields with the provided data and scroll down to reveal the Start Session button.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Explainability')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('38')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div[3]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('ALS Stage 2')
        
        # -> Fill all 6 registration fields with the provided data and scroll down to reveal the Start Session button.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Explainability')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('38')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/form/div[2]/div[3]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('ALS Stage 2')
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'Risk score: 78 - Elevated risk due to tachycardia. Recommended action: Activate SOS alarm')]").nth(0).is_visible(), "The UI should display a risk score with reasoning and a recommended action after the vitals assessment"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    