# AWS Lambda Deployment Script for JWE Functions (PowerShell)
# Usage: .\deploy.ps1 -Region us-east-1 -AccountId 123456789012

param(
    [Parameter(Mandatory=$true)]
    [string]$Region,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountId,
    
    [string]$RoleName = "lambda-jwe-role"
)

$ErrorActionPreference = "Stop"

$RoleArn = "arn:aws:iam::${AccountId}:role/${RoleName}"

Write-Host "🚀 Deploying JOSE Lambda Functions to AWS" -ForegroundColor Cyan
Write-Host "   Region: $Region" -ForegroundColor Cyan
Write-Host "   Account: $AccountId" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create IAM Role
Write-Host "[Step 1/6] Creating IAM Lambda Execution Role..." -ForegroundColor Blue

$TrustPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Principal = @{
                Service = "lambda.amazonaws.com"
            }
            Action = "sts:AssumeRole"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    aws iam get-role --role-name $RoleName --region $Region | Out-Null
    Write-Host "   Role already exists: $RoleArn" -ForegroundColor Yellow
} catch {
    Write-Host "   Creating new role..." -ForegroundColor Yellow
    
    $TrustPolicyFile = New-TemporaryFile
    $TrustPolicy | Out-File -FilePath $TrustPolicyFile -Force
    
    aws iam create-role `
        --role-name $RoleName `
        --assume-role-policy-document file://$TrustPolicyFile `
        --region $Region | Out-Null
    
    Remove-Item $TrustPolicyFile
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy `
        --role-name $RoleName `
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole `
        --region $Region | Out-Null
    
    Write-Host "   ✅ Role created: $RoleArn" -ForegroundColor Green
}

# Wait for role to be available
Write-Host "   Waiting for role to be available..."
Start-Sleep -Seconds 10

# Step 2: Package Encryptor
Write-Host ""
Write-Host "[Step 2/6] Packaging jose-encryptor..." -ForegroundColor Blue

Push-Location jose-encryptor
Remove-Item ..\function-encryptor.zip -ErrorAction SilentlyContinue
Compress-Archive -Path . -DestinationPath ..\function-encryptor.zip -Force -Exclude "node_modules", ".git"

if (!(Test-Path "node_modules")) {
    npm install --production | Out-Null
}

Compress-Archive -Path node_modules -DestinationPath ..\function-encryptor.zip -Update

Pop-Location
Write-Host "   ✅ Package created: function-encryptor.zip" -ForegroundColor Green

# Step 3: Package Decryptor
Write-Host ""
Write-Host "[Step 3/6] Packaging jose-decryptor..." -ForegroundColor Blue

Push-Location jose-decryptor
Remove-Item ..\function-decryptor.zip -ErrorAction SilentlyContinue
Compress-Archive -Path . -DestinationPath ..\function-decryptor.zip -Force -Exclude "node_modules", ".git"

if (!(Test-Path "node_modules")) {
    npm install --production | Out-Null
}

Compress-Archive -Path node_modules -DestinationPath ..\function-decryptor.zip -Update

Pop-Location
Write-Host "   ✅ Package created: function-decryptor.zip" -ForegroundColor Green

# Step 4: Deploy Encryptor
Write-Host ""
Write-Host "[Step 4/6] Deploying jose-encryptor function..." -ForegroundColor Blue

try {
    aws lambda get-function --function-name jose-encryptor --region $Region | Out-Null
    Write-Host "   Updating existing function..." -ForegroundColor Yellow
    
    aws lambda update-function-code `
        --function-name jose-encryptor `
        --zip-file fileb://function-encryptor.zip `
        --region $Region | Out-Null
    
    Write-Host "   ✅ Function updated: jose-encryptor" -ForegroundColor Green
} catch {
    Write-Host "   Creating new function..." -ForegroundColor Yellow
    
    aws lambda create-function `
        --function-name jose-encryptor `
        --runtime nodejs20.x `
        --role $RoleArn `
        --handler src/index.handler `
        --zip-file fileb://function-encryptor.zip `
        --timeout 30 `
        --memory-size 256 `
        --region $Region | Out-Null
    
    Write-Host "   ✅ Function created: jose-encryptor" -ForegroundColor Green
}

# Step 5: Deploy Decryptor
Write-Host ""
Write-Host "[Step 5/6] Deploying jose-decryptor function..." -ForegroundColor Blue

try {
    aws lambda get-function --function-name jose-decryptor --region $Region | Out-Null
    Write-Host "   Updating existing function..." -ForegroundColor Yellow
    
    aws lambda update-function-code `
        --function-name jose-decryptor `
        --zip-file fileb://function-decryptor.zip `
        --region $Region | Out-Null
    
    Write-Host "   ✅ Function updated: jose-decryptor" -ForegroundColor Green
} catch {
    Write-Host "   Creating new function..." -ForegroundColor Yellow
    
    aws lambda create-function `
        --function-name jose-decryptor `
        --runtime nodejs20.x `
        --role $RoleArn `
        --handler src/index.handler `
        --zip-file fileb://function-decryptor.zip `
        --timeout 30 `
        --memory-size 256 `
        --region $Region | Out-Null
    
    Write-Host "   ✅ Function created: jose-decryptor" -ForegroundColor Green
}

# Step 6: Store Keys in Secrets Manager
Write-Host ""
Write-Host "[Step 6/6] Storing encryption keys in AWS Secrets Manager..." -ForegroundColor Blue

# Public key
try {
    aws secretsmanager describe-secret --secret-id jose-encryptor-public-key --region $Region | Out-Null
    Write-Host "   Updating existing secret: jose-encryptor-public-key" -ForegroundColor Yellow
    
    aws secretsmanager update-secret `
        --secret-id jose-encryptor-public-key `
        --secret-string file://keys/public.pem `
        --region $Region | Out-Null
} catch {
    Write-Host "   Creating new secret: jose-encryptor-public-key" -ForegroundColor Yellow
    
    aws secretsmanager create-secret `
        --name jose-encryptor-public-key `
        --secret-string file://keys/public.pem `
        --region $Region | Out-Null
}

# Private key
try {
    aws secretsmanager describe-secret --secret-id jose-decryptor-private-key --region $Region | Out-Null
    Write-Host "   Updating existing secret: jose-decryptor-private-key" -ForegroundColor Yellow
    
    aws secretsmanager update-secret `
        --secret-id jose-decryptor-private-key `
        --secret-string file://keys/private.pem `
        --region $Region | Out-Null
} catch {
    Write-Host "   Creating new secret: jose-decryptor-private-key" -ForegroundColor Yellow
    
    aws secretsmanager create-secret `
        --name jose-decryptor-private-key `
        --secret-string file://keys/private.pem `
        --region $Region | Out-Null
}

Write-Host "   ✅ Secrets stored in AWS Secrets Manager" -ForegroundColor Green

# Cleanup
Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Functions deployed:"
Write-Host "  - jose-encryptor: Ready for encryption operations"
Write-Host "  - jose-decryptor: Ready for decryption operations"
Write-Host ""
Write-Host "Testing the functions:"
Write-Host ""
Write-Host "Test Encryptor:"
Write-Host "  aws lambda invoke \`"
Write-Host "    --function-name jose-encryptor \`"
Write-Host "    --payload '{""payload"":{""message"":""test""}}' \`"
Write-Host "    response.json \`"
Write-Host "    --region $Region"
Write-Host ""
Write-Host "Test Decryptor:"
Write-Host "  aws lambda invoke \`"
Write-Host "    --function-name jose-decryptor \`"
Write-Host "    --payload '{""jwe"":""<encrypted-token>""}' \`"
Write-Host "    response.json \`"
Write-Host "    --region $Region"
Write-Host ""
Write-Host "Cleanup temporary files:"
Write-Host "  Remove-Item function-encryptor.zip, function-decryptor.zip"
