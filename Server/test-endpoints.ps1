# Test script for API endpoints
$baseUrl = "http://localhost:5000/api/v1"

Write-Host "=== Testing Restaurant Reservation API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register Admin
Write-Host "1. Testing Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        name = "Test Admin"
        email = "testadmin$(Get-Random)@test.com"
        password = "test123"
        role = "Admin"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -SessionVariable session
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "User: $($registerResponse.user.name) - $($registerResponse.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Login
Write-Host "2. Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $registerResponse.user.email
        password = "test123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -WebSession $session
    Write-Host "✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 3: Create Table
Write-Host "3. Testing Create Table..." -ForegroundColor Yellow
try {
    $tableBody = @{
        tableNumber = "T-TEST-$(Get-Random -Maximum 100)"
        capacity = 4
        location = "Indoor"
        features = @("Window View", "Quiet Area")
    } | ConvertTo-Json

    $tableResponse = Invoke-RestMethod -Uri "$baseUrl/tables" -Method POST -Body $tableBody -ContentType "application/json" -WebSession $session
    Write-Host "✓ Table created successfully" -ForegroundColor Green
    Write-Host "Table: $($tableResponse.table.tableNumber) - Capacity: $($tableResponse.table.capacity)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Table creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 4: Get All Tables
Write-Host "4. Testing Get All Tables..." -ForegroundColor Yellow
try {
    $tablesResponse = Invoke-RestMethod -Uri "$baseUrl/tables" -Method GET -WebSession $session
    Write-Host "✓ Retrieved $($tablesResponse.count) tables" -ForegroundColor Green
} catch {
    Write-Host "✗ Get tables failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan
