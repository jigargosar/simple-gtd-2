import { type Page, expect } from '@playwright/test'

// Centralizes locators + setup for the board so every test starts from a
// known, verified state instead of assuming a default that can silently
// differ between the seed data and whatever a previous run left behind.
export class BoardPage {
    constructor(private page: Page) {}

    get rows() {
        return this.page.locator('li[data-flip-id]')
    }

    rowTop(index: number) {
        return this.rows
            .nth(index)
            .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    }

    async goto() {
        await this.page.goto('/simple-gtd-2/')
    }

    // dev-only reset button — guarantees known seed data regardless of
    // whatever localStorage state a prior run left behind
    async reset() {
        await this.page.getByRole('button', { name: 'Reset' }).click()
    }

    // Opens the menu, sets "Show completed" to exactly `value`, closes the
    // menu, then re-opens it to verify the checkbox actually landed on the
    // requested state before returning — so a caller never has to guess
    // whether the toggle click did what it meant to.
    async setShowDone(value: boolean) {
        await this.page.getByRole('button', { name: 'Menu' }).click()
        const toggle = this.page.getByRole('button', { name: 'Show completed' })
        const checkedNow = await toggle.locator('svg').isVisible()
        if (checkedNow !== value) await toggle.click()
        await expect(toggle.locator('svg')).toBeVisible({ visible: value })
        // menu only closes via its backdrop click (no Escape handler)
        await this.page.locator('.fixed.inset-0.z-10').click()
    }
}
