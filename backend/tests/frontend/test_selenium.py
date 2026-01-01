import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

@pytest.fixture(scope="module")
def driver():
    """
    Setup Chrome Driver for Selenium
    """
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Run properly without UI if needed
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Initialize Driver
    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.maximize_window()
    
    yield driver
    
    # Teardown
    driver.quit()

def test_homepage_title(driver):
    """
    Test if the homepage loads and title is correct
    """
    driver.get("http://localhost:5173")
    time.sleep(2)  # Wait for React to hydrate
    
    # Check title - adjust expected title to what is actually in index.html
    # Default Vite app title might be 'Vite + React' or 'CampusHub' if changed
    assert "Vite" in driver.title or "CampusHub" in driver.title 

def test_login_page_loads(driver):
    """
    Test if navigation to /login works
    """
    driver.get("http://localhost:5173/login")
    time.sleep(2)
    
    # You can assert presence of login form elements here
    # For now, just checking we didn't crash
    assert "login" in driver.current_url.lower()
