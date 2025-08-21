#!/usr/bin/env node

/**
 * Smoke Test Script for Visite Sri3a
 * Tests basic functionality after deployment to Netlify
 */

const https = require('https');

const BASE_URL = process.env.APP_URL || 'https://visite-sri3a.netlify.app';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'User-Agent': 'Visite-Sri3a-Smoke-Test/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    log(`Testing ${name}...`, colors.blue);
    const response = await makeRequest(url);

    if (response.status === expectedStatus) {
      log(`✅ ${name}: PASS (${response.status})`, colors.green);

      // Try to parse JSON for API endpoints
      if (url.includes('/api/')) {
        try {
          const json = JSON.parse(response.data);
          if (Array.isArray(json) && json.length > 0) {
            log(`   📊 Data: Found ${json.length} items`, colors.yellow);
          } else if (json.success !== undefined) {
            log(`   📊 Response: ${json.success ? 'Success' : 'Error'}`, colors.yellow);
          }
        } catch (e) {
          // Not JSON, that's okay
        }
      }

      return true;
    } else {
      log(`❌ ${name}: FAIL (Expected ${expectedStatus}, got ${response.status})`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ ${name}: ERROR (${error.message})`, colors.red);
    return false;
  }
}

async function testProtectedRoute() {
  try {
    log('Testing protected route redirect...', colors.blue);
    const response = await makeRequest(`${BASE_URL}/admin`);

    // Admin route should redirect to login (302/301) or show login form (200 with redirect)
    if (response.status === 302 || response.status === 301 || response.status === 200) {
      // Check if it redirects to auth or contains login elements
      const hasAuth = response.data.includes('signin') ||
                     response.data.includes('login') ||
                     response.headers.location?.includes('signin');

      if (hasAuth || response.status === 302 || response.status === 301) {
        log(`✅ Protected route: PASS (Properly redirects when not authenticated)`, colors.green);
        return true;
      }
    }

    log(`❌ Protected route: FAIL (No proper authentication protection)`, colors.red);
    return false;
  } catch (error) {
    log(`❌ Protected route: ERROR (${error.message})`, colors.red);
    return false;
  }
}

async function runSmokeTest() {
  log('\n🚀 Starting Visite Sri3a Smoke Test', colors.blue);
  log(`🌐 Base URL: ${BASE_URL}`, colors.yellow);
  log('=' * 50, colors.blue);

  const tests = [
    // Basic page loads
    { name: 'Home Page', url: `${BASE_URL}` },
    { name: 'Sign In Page', url: `${BASE_URL}/auth/signin` },

    // API endpoints
    { name: 'Centers API', url: `${BASE_URL}/api/centers` },
    { name: 'Time Slots API', url: `${BASE_URL}/api/time-slots` },

    // Localized routes
    { name: 'French Home', url: `${BASE_URL}/fr` },
    { name: 'Arabic Home', url: `${BASE_URL}/ar` },
    { name: 'English Home', url: `${BASE_URL}/en` },
  ];

  let passed = 0;
  let total = tests.length + 1; // +1 for protected route test

  // Run basic endpoint tests
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url, test.expectedStatus || 200);
    if (result) passed++;

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test protected route
  const protectedResult = await testProtectedRoute();
  if (protectedResult) passed++;

  log('\n' + '=' * 50, colors.blue);
  log(`📊 Smoke Test Results: ${passed}/${total} tests passed`,
      passed === total ? colors.green : colors.red);

  if (passed === total) {
    log('🎉 ALL TESTS PASSED - Application is working correctly!', colors.green);
    process.exit(0);
  } else {
    log('❌ SOME TESTS FAILED - Please check the application', colors.red);
    process.exit(1);
  }
}

// Check if URL is provided as argument
if (process.argv[2]) {
  BASE_URL = process.argv[2];
}

runSmokeTest().catch(error => {
  log(`💥 Smoke test crashed: ${error.message}`, colors.red);
  process.exit(1);
});
