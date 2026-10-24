import { expect, type Page } from '@playwright/test';

export async function filterDesigner(page: Page) {
  const dropdown = page.getByLabel('Filter guides by role');
  const chips = page.getByRole('navigation', { name: 'Guide roles' });
  if (page.viewportSize()!.width <= 650) {
    await expect(dropdown).toBeVisible();
    await expect(chips).not.toBeVisible();
    await dropdown.selectOption('Designer');
    await page.getByRole('button', { name: 'Apply filters' }).click();
  } else {
    await expect(dropdown).not.toBeVisible();
    await expect(chips).toBeVisible();
    // Submit the title first; role links retain the applied title query.
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await chips.getByRole('link', { name: 'Design', exact: true }).click();
  }
  await expect(dropdown).toHaveValue('Designer');
}
