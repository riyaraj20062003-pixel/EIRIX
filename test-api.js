const http = require('http');

function testAPI(testName, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/api/burnout/predict',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          console.log(`\n✅ ${testName}`);
          console.log(`   Score: ${result.burnout_score}, Risk: ${result.risk_level}, Confidence: ${result.confidence}%`);
          resolve(result);
        } catch (e) {
          console.log(`\n❌ ${testName}: ${e.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', err => {
      console.log(`\n❌ ${testName}: ${err.message}`);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Burnout Calculator...\n');
  
  // Test 1: Low stress
  await testAPI('LOW STRESS TEST', {
    sleep_hours: 8,
    study_hours: 4,
    stress_level: 2,
    assignment_load: 1,
    mood: "Excellent",
    social_activity: 8,
    screen_time: 2,
    motivation_level: 9
  });

  // Test 2: High stress
  await testAPI('HIGH STRESS TEST', {
    sleep_hours: 4,
    study_hours: 12,
    stress_level: 9,
    assignment_load: 10,
    mood: "Very Low",
    social_activity: 1,
    screen_time: 14,
    motivation_level: 1
  });

  // Test 3: Moderate stress
  await testAPI('MODERATE STRESS TEST', {
    sleep_hours: 6,
    study_hours: 6,
    stress_level: 5,
    assignment_load: 5,
    mood: "Neutral",
    social_activity: 5,
    screen_time: 6,
    motivation_level: 5
  });

  console.log('\n✨ Test complete!\n');
}

runTests();
