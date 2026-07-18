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

test('spike: revealing a hidden item slides item 3 down without overshoot', async ({ page }) => {
    await page.goto('/simple-gtd-2/docs/spikes/mockups/flip-spike.html')

    // hide item 2 first (checked + Show completed off), matching the
    // "unhide via Show completed" repro: item 3 sits right after item 1
    await page.locator('[data-id="2"] input').check()
    await page.locator('#show-done').uncheck()
    await expect(page.locator('[data-id="2"]')).toBeHidden()

    const row3 = page.locator('[data-id="3"]')

    // reveal item 2 — item 3 must slide DOWN to make room. Sample through
    // the transition (200ms) into the settled state (last sample = final).
    await page.locator('#show-done').check()

    const samples: number[] = []
    for (let i = 0; i < 15; i++) {
        samples.push(await row3.evaluate(docTop))
        await page.waitForTimeout(20)
    }

    const final = samples[samples.length - 1]
    const maxTop = Math.max(...samples)
    // item 3 should approach `final` monotonically from above (it starts
    // higher, ends lower) — it must never travel PAST final and back up.
    expect(maxTop).toBeLessThanOrEqual(final + 2)
})
