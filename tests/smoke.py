from pathlib import Path

from playwright.sync_api import sync_playwright


OUTPUT = Path("/tmp/winchester-buyer-check.png")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors: list[str] = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.goto("http://127.0.0.1:8765")
    page.wait_for_load_state("networkidle")

    assert page.title() == "Winchester Buyer Check"
    assert page.locator("#monthly").inner_text() == "£1,938"
    assert page.locator("#ltv").inner_text() == "85.0%"

    page.locator("#deposit").fill("112500")
    assert page.locator("#ltv").inner_text() == "75.0%"
    assert page.locator("#monthly").inner_text() == "£1,710"
    assert not errors, errors

    page.screenshot(path=str(OUTPUT), full_page=True)
    browser.close()

print(f"Smoke test passed; screenshot: {OUTPUT}")
