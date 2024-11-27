import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { strict as assert } from 'assert';

describe('End-to-End Testing with Selenium', function () {
  this.timeout(60000);

  let driver;

  const initializeDriver = async () => {
    const options = new chrome.Options();
    options.addArguments('--disable-gpu', '--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .usingServer('http://localhost:9515')
      .build();
  };

  const tearDownDriver = async () => {
    if (driver) {
      await driver.quit();
    }
  };

  const hideWebpackOverlay = async () => {
    await driver.executeScript(`
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.style.zIndex = '-1';
      }
    `);

    await driver.wait(async () => {
      const overlayVisible = await driver.executeScript(`
        const overlay = document.getElementById('webpack-dev-server-client-overlay');
        return overlay && overlay.style.zIndex !== '-1';
      `);
      return !overlayVisible;
    }, 5000, 'Overlay did not disappear in time');
  };

  const clickElementWithRetry = async (locator) => {
    for (let i = 0; i < 3; i++) {
      try {
        const element = await driver.findElement(locator);

        // Ensure the element is visible and enabled
        await driver.wait(until.elementIsVisible(element), 5000);
        await driver.wait(until.elementIsEnabled(element), 5000);

        // Scroll to the element to ensure visibility
        await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", element);

        // Click the element
        await element.click();
        return;
      } catch (e) {
        if (e.name === 'StaleElementReferenceError') {
          console.log('Element became stale, retrying...');
        } else if (e.name === 'ElementClickInterceptedError') {
          console.log('Click intercepted, retrying...');
          // Hide any potential overlay
          await driver.executeScript(`
            const overlay = document.getElementById('webpack-dev-server-client-overlay');
            if (overlay) {
              overlay.style.display = 'none';
              overlay.style.zIndex = '-1';
            }
          `);
        } else {
          throw e;
        }
        await driver.sleep(1000);
      }
    }
    throw new Error('Element click failed after multiple attempts');
  };

  beforeEach(async () => {
    await initializeDriver();
    await driver.get('http://localhost:3000/login');
  });

  afterEach(async () => {
    await tearDownDriver();
  });

  it('Admin Login Test', async () => {
    await hideWebpackOverlay();

    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    await driver.findElement(By.css('input[type="email"]')).sendKeys('test@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Pasword@');
    await clickElementWithRetry(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('admin'), 15000);
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('admin'), 'Admin login failed or did not navigate correctly');
  });

  it('Admin Logout Test', async () => {
    await hideWebpackOverlay();

    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    await driver.findElement(By.css('input[type="email"]')).sendKeys('test@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Pasword@');
    await clickElementWithRetry(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('admin'), 15000);

    const logoutButtonLocator = By.css('.logout-button');
    await clickElementWithRetry(logoutButtonLocator);
    await driver.wait(until.urlIs('http://localhost:3000/login'), 15000);
  });

  it('Student Login Test', async () => {
    await hideWebpackOverlay();

    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    await driver.findElement(By.css('input[type="email"]')).sendKeys('student@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Pasword@');
    await clickElementWithRetry(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('student'), 15000);
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('student'), 'Student login failed or did not navigate correctly');
  });

  it('Student Logout Test', async () => {
    await hideWebpackOverlay();

    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    await driver.findElement(By.css('input[type="email"]')).sendKeys('student@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Pasword@');
    await clickElementWithRetry(By.css('button[type="submit"]'));

    await driver.wait(until.urlContains('student'), 15000);

    const logoutButtonLocator = By.css('.logout-button');
    await clickElementWithRetry(logoutButtonLocator);
    await driver.wait(until.urlIs('http://localhost:3000/login'), 15000);
  });

  it('Create Post and Verify Reply Sync Test', async () => {
    await hideWebpackOverlay();

    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    await driver.findElement(By.css('input[type="email"]')).sendKeys('test@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Pasword@');
    await clickElementWithRetry(By.css('button[type="submit"]'));
    await driver.wait(until.urlContains('admin'), 15000);

    const quillEditorLocator = By.css('.ql-editor');
    const postButtonLocator = By.css('.post-button');

    await driver.wait(until.elementLocated(quillEditorLocator), 10000);
    const quillEditor = await driver.findElement(quillEditorLocator);
    await driver.executeScript("arguments[0].innerHTML = '<p>This is a test post from admin.</p>';", quillEditor);

    await clickElementWithRetry(postButtonLocator);

    const logoutButtonLocator = By.css('.logout-button');
    await clickElementWithRetry(logoutButtonLocator);
    await driver.wait(until.urlIs('http://localhost:3000/login'), 15000);

    await driver.findElement(By.css('input[type="email"]')).sendKeys('student@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Pasword@');
    await clickElementWithRetry(By.css('button[type="submit"]'));
    await driver.wait(until.urlContains('student'), 15000);

    await driver.wait(until.elementLocated(quillEditorLocator), 10000);
    const replyEditor = await driver.findElement(quillEditorLocator);
    await driver.executeScript("arguments[0].innerHTML = '<p>This is a test reply from student.</p>';", replyEditor);

    const replyButtonLocator = By.css('.reply-button');
    await clickElementWithRetry(replyButtonLocator);

    const replyTextLocator = By.xpath("//*[contains(text(),'This is a test reply from student.')]");
    const replyText = await driver.wait(until.elementLocated(replyTextLocator), 15000);
    assert(replyText, 'Reply did not appear under the post as expected');
  });
});











