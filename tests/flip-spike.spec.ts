import { test, expect } from '@playwright/test'

// Sanity check against the isolated spike (docs/spikes/mockups/flip-spike.html)
// before trusting any result against the real app — proves the core FLIP math
// (document-relative measurement) is correct in total isolation, no React/
// dnd-kit/multi-section noise. Manually verified by hand earlier in the
// debugging session; this locks that verification in.
test.use({ viewport: { width: 800, height: 400 } })

function docTop(el: Element) {
    return el.getBoundingClientRect().top + window.scrollY
}

test('spike: hiding item 2 while scrolled does not move item 1', async ({ page }) => {
    await page.goto('/simple-gtd-2/docs/spikes/mockups/flip-spike.html')

    // explicit, verified precondition — the file defaults #show-done to
    // checked, so hiding an item requires turning it off first
    await page.locator('#show-done').uncheck()
    await expect(page.locator('#show-done')).not.toBeChecked()

    const rows = page.locator('.row')
    const row1 = rows.nth(0)
    const row2 = rows.nth(1)
    const row3 = rows.nth(2)

    const row1TopBefore = await row1.evaluate(docTop)
    const row3TopBefore = await row3.evaluate(docTop)

    await page.evaluate(() => window.scrollBy(0, 150))
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0) // sanity

    await row2.locator('input').click()
    await page.waitForTimeout(300) // let the FLIP transition settle

    const row1TopAfter = await row1.evaluate(docTop)
    const row3TopAfter = await row3.evaluate(docTop)

    // document-relative top cancels scroll out — before/after should match
    // directly, no manual scrollY adjustment needed
    expect(Math.abs(row1TopAfter - row1TopBefore)).toBeLessThan(2)
    expect(row3TopAfter).toBeLessThan(row3TopBefore - 5)
})
