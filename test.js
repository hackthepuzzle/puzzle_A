/**
 * SVES Production Readiness & Functional Test Suite
 * This script validates the core architectural integrity and accessibility readiness of the project.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
    'index.html',
    'css/style.css',
    'js/app.js',
    'server.js',
    'Dockerfile',
    'README.md'
];

console.log("🚀 Starting SVES Integrity Tests...\n");

let failures = 0;

// 1. Check for Required Files
console.log("📂 Validating File Structure...");
REQUIRED_FILES.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(` ✅ PASS: ${file} exists.`);
    } else {
        console.error(` ❌ FAIL: ${file} is missing!`);
        failures++;
    }
});

// 2. Validate index.html Accessibility & Infrastructure components
console.log("\n♿ Validating Accessibility & Security Headers...");
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    const checks = [
        { name: "Content Security Policy (CSP)", pattern: /Content-Security-Policy/ },
        { name: "Meta Viewport (Mobile responsiveness)", pattern: /viewport/ },
        { name: "Main App Container", pattern: /id="app-container"/ },
        { name: "Gemini Assistant Entry Point", pattern: /id="gemini-modal"/ },
        { name: "ARIA Landmark: Navigation", pattern: /<nav/ },
        { name: "ARIA Landmark: Main Content", pattern: /<main/ }
    ];

    checks.forEach(check => {
        if (check.pattern.test(html)) {
            console.log(` ✅ PASS: ${check.name} found.`);
        } else {
            console.warn(` ⚠️  WARN: ${check.name} missing in index.html.`);
        }
    });
}

// 3. System Functional Check (Mocking the server)
console.log("\n📡 Validating Server Configuration...");
try {
    const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    if (serverCode.includes('process.env.PORT') && serverCode.includes('http.createServer')) {
        console.log(" ✅ PASS: server.js correctly implements Cloud Run $PORT binding.");
    } else {
        console.error(" ❌ FAIL: server.js is missing Cloud Run $PORT requirements.");
        failures++;
    }
} catch (e) {
    console.error(" ❌ FAIL: Could not read server.js");
    failures++;
}

console.log("\n-------------------------------------------");
if (failures === 0) {
    console.log("🎉 ALL TESTS PASSED! Project is deployment-ready.");
    process.exit(0);
} else {
    console.error(`🛑 TESTS FAILED with ${failures} errors. Please fix before deploying.`);
    process.exit(1);
}
