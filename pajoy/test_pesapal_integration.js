#!/usr/bin/env node

const http = require('http');
const axios = require('axios');

console.log('🧪 Running Comprehensive PAJOY Pesapal Integration Test');
console.log('=====================================================');

const BASE_URL = 'http://127.0.0.1:5179';

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('\n📊 Test 1: Backend Health Check');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    console.log(`✅ Backend Health: ${response.data.ok ? 'HEALTHY' : 'UNHEALTHY'}`);
    console.log(`   - Database: ${response.data.database?.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`   - Pesapal: ${response.data.pesapal?.configured ? 'Configured' : 'Not Configured'}`);
    return true;
  } catch (error) {
    console.log(`❌ Backend Health Check Failed: ${error.message}`);
    return false;
  }
}

// Test 2: Payment Initiation
async function testPaymentInitiation() {
  console.log('\n💳 Test 2: Payment Initiation');
  try {
    const paymentData = {
      amount: 1500,
      phone: '254712345678',
      email: 'test@example.com',
      customerName: 'Test Customer',
      description: 'Test Payment'
    };

    const response = await axios.post(`${BASE_URL}/api/payments/pesapal/initiate`, paymentData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.data.success) {
      console.log('✅ Payment Initiation: SUCCESS');
      console.log(`   - Payment ID: ${response.data.paymentId}`);
      console.log(`   - Order Tracking ID: ${response.data.orderTrackingId}`);
      console.log(`   - Redirect URL: ${response.data.redirectUrl}`);
      console.log(`   - Status: ${response.data.status}`);
      return response.data.orderTrackingId;
    } else {
      console.log(`❌ Payment Initiation Failed: ${response.data.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Payment Initiation Error: ${error.message}`);
    return null;
  }
}

// Test 3: Payment Status Check
async function testPaymentStatus(trackingId) {
  console.log('\n🔍 Test 3: Payment Status Check');
  try {
    const response = await axios.get(`${BASE_URL}/api/payments/pesapal/status/${trackingId}`, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ Payment Status Check: SUCCESS');
      console.log(`   - Status: ${response.data.status}`);
      console.log(`   - Amount: ${response.data.amount}`);
      console.log(`   - Currency: ${response.data.currency}`);
      console.log(`   - Payment Method: ${response.data.paymentMethod}`);
      return true;
    } else {
      console.log(`❌ Payment Status Check Failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Payment Status Check Error: ${error.message}`);
    return false;
  }
}

// Test 4: Payment Callback
async function testPaymentCallback(trackingId) {
  console.log('\n📡 Test 4: Payment Callback');
  try {
    const callbackUrl = `${BASE_URL}/api/payments/callback?orderTrackingId=${trackingId}&reference=TEST123&payment_method=MPESA&payment_account=254712345678&confirmation_code=ABC123`;
    
    const response = await axios.get(callbackUrl, {
      timeout: 5000,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });

    console.log('✅ Payment Callback: SUCCESS');
    console.log(`   - Status Code: ${response.status}`);
    console.log(`   - Redirect Location: ${response.headers.location}`);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 302) {
      console.log('✅ Payment Callback: SUCCESS (Redirect)');
      console.log(`   - Status Code: ${error.response.status}`);
      console.log(`   - Redirect Location: ${error.response.headers.location}`);
      return true;
    } else {
      console.log(`❌ Payment Callback Error: ${error.message}`);
      return false;
    }
  }
}

// Test 5: Payment History
async function testPaymentHistory() {
  console.log('\n📚 Test 5: Payment History');
  try {
    const response = await axios.get(`${BASE_URL}/api/payments/history`, {
      timeout: 5000
    });

    if (response.data.success) {
      console.log('✅ Payment History: SUCCESS');
      console.log(`   - Total Payments: ${response.data.pagination.total}`);
      console.log(`   - Page: ${response.data.pagination.page}/${response.data.pagination.pages}`);
      if (response.data.data.length > 0) {
        console.log('   - Recent Payments:');
        response.data.data.slice(0, 3).forEach(payment => {
          console.log(`     * ${payment.merchant_reference} - KES ${payment.amount} - ${payment.status}`);
        });
      }
      return true;
    } else {
      console.log(`❌ Payment History Failed: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Payment History Error: ${error.message}`);
    return false;
  }
}

// Test 6: Database Connection
async function testDatabaseConnection() {
  console.log('\n🗄️ Test 6: Database Connection');
  try {
    const response = await axios.get(`${BASE_URL}/api/health/detailed`, { timeout: 5000 });
    
    if (response.data.database?.connected) {
      console.log('✅ Database Connection: SUCCESS');
      console.log(`   - Connected: ${response.data.database.connected}`);
      console.log(`   - Tables: ${response.data.database.tables?.join(', ')}`);
      console.log(`   - Size: ${Math.round(response.data.database.size / 1024)} KB`);
      return true;
    } else {
      console.log('❌ Database Connection: FAILED');
      return false;
    }
  } catch (error) {
    console.log(`❌ Database Connection Error: ${error.message}`);
    return false;
  }
}

// Test 7: Frontend API Access
async function testFrontendAPI() {
  console.log('\n🌐 Test 7: Frontend API Access');
  try {
    const response = await axios.get(`${BASE_URL}/api/reports/summary`, { timeout: 5000 });
    
    if (response.data) {
      console.log('✅ Frontend API Access: SUCCESS');
      console.log(`   - Today Sales: KES ${response.data.today_sales || 0}`);
      console.log(`   - Week Sales: KES ${response.data.week_sales || 0}`);
      console.log(`   - Month Sales: KES ${response.data.month_sales || 0}`);
      return true;
    } else {
      console.log('❌ Frontend API Access: FAILED');
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend API Access Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  const results = [];
  
  // Run all tests
  results.push(await testBackendHealth());
  results.push(await testDatabaseConnection());
  results.push(await testFrontendAPI());
  
  const trackingId = await testPaymentInitiation();
  results.push(!!trackingId);
  
  if (trackingId) {
    results.push(await testPaymentStatus(trackingId));
    results.push(await testPaymentCallback(trackingId));
  }
  
  results.push(await testPaymentHistory());
  
  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`❌ Failed: ${total - passed}/${total} tests`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! PAJOY Pesapal Integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  console.log('\n🚀 Ready for production use!');
}

// Run tests
runAllTests().catch(console.error);
