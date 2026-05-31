# AWS Deployment Guide for JOSE Lambda Functions

This guide provides step-by-step instructions to deploy both Lambda functions to AWS.

## 📋 Prerequisites

### Required
- ✅ AWS Account with appropriate permissions
- ✅ AWS CLI v2 configured with credentials
- ✅ Node.js v20.x or later
- ✅ Git (for version control)

### Verify Prerequisites
```bash
# Check AWS CLI
aws --version
# Output: aws-cli/2.x.x

# Check AWS credentials
aws sts get-caller-identity
# Should show your AWS account details

# Check Node.js
node --version
# Output: v20.x.x or later
```

## 🚀 Quick Start (Windows - PowerShell)

### 1. Get Your AWS Account ID

```powershell
$accountId = aws sts get-caller-identity --query Account --output text
Write-Host "Your AWS Account ID: $accountId"
```

### 2. Run Deployment Script

```powershell
# From the lamda directory
.\deploy.ps1 -Region us-east-1 -AccountId 123456789012
```

The script will:
- ✅ Create IAM role for Lambda execution
- ✅ Package both Lambda functions
- ✅ Deploy functions to AWS
- ✅ Store encryption keys in Secrets Manager

### 3. Verify Deployment

```powershell
# List deployed functions
aws lambda list-functions --region us-east-1 --query 'Functions[?contains(FunctionName, `jose`)]'

# Test encryptor
aws lambda invoke `
  --function-name jose-encryptor `
  --payload '{\"payload\":{\"message\":\"Hello AWS!\"}}' `
  response.json `
  --region us-east-1

Get-Content response.json | ConvertFrom-Json
```

## 🚀 Quick Start (macOS/Linux - Bash)

### 1. Get Your AWS Account ID

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Your AWS Account ID: $ACCOUNT_ID"
```

### 2. Run Deployment Script

```bash
# From the lamda directory
chmod +x deploy.sh
./deploy.sh us-east-1 $ACCOUNT_ID
```

### 3. Verify Deployment

```bash
# List deployed functions
aws lambda list-functions \
  --region us-east-1 \
  --query 'Functions[?contains(FunctionName, `jose`)]'

# Test encryptor
aws lambda invoke \
  --function-name jose-encryptor \
  --payload '{"payload":{"message":"Hello AWS!"}}' \
  response.json \
  --region us-east-1

cat response.json
```

## 📝 Manual Deployment Steps

If you prefer to deploy manually without scripts:

### Step 1: Create IAM Role

```powershell
# PowerShell
$trustPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Principal = @{ Service = "lambda.amazonaws.com" }
            Action = "sts:AssumeRole"
        }
    )
} | ConvertTo-Json

aws iam create-role `
  --role-name lambda-jwe-role `
  --assume-role-policy-document $trustPolicy `
  --region us-east-1

aws iam attach-role-policy `
  --role-name lambda-jwe-role `
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole `
  --region us-east-1
```

```bash
# Bash
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name lambda-jwe-role \
  --assume-role-policy-document file://trust-policy.json \
  --region us-east-1

aws iam attach-role-policy \
  --role-name lambda-jwe-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --region us-east-1

rm trust-policy.json
```

### Step 2: Package Functions

#### Package Encryptor
```powershell
# PowerShell
cd jose-encryptor
Compress-Archive -Path . -DestinationPath ..\function-encryptor.zip -Force -Exclude "node_modules", ".git"
npm install --production
Compress-Archive -Path node_modules -DestinationPath ..\function-encryptor.zip -Update
cd ..
```

```bash
# Bash
cd jose-encryptor
zip -r -q ../function-encryptor.zip . -x "node_modules/*" ".git/*"
npm install --production
zip -r -q ../function-encryptor.zip node_modules/
cd ..
```

#### Package Decryptor
```powershell
# PowerShell
cd jose-decryptor
Compress-Archive -Path . -DestinationPath ..\function-decryptor.zip -Force -Exclude "node_modules", ".git"
npm install --production
Compress-Archive -Path node_modules -DestinationPath ..\function-decryptor.zip -Update
cd ..
```

```bash
# Bash
cd jose-decryptor
zip -r -q ../function-decryptor.zip . -x "node_modules/*" ".git/*"
npm install --production
zip -r -q ../function-decryptor.zip node_modules/
cd ..
```

### Step 3: Create Lambda Functions

```powershell
# PowerShell
$accountId = "123456789012"  # Replace with your account ID
$roleArn = "arn:aws:iam::${accountId}:role/lambda-jwe-role"

# Wait for role to be available
Start-Sleep -Seconds 10

# Create Encryptor
aws lambda create-function `
  --function-name jose-encryptor `
  --runtime nodejs20.x `
  --role $roleArn `
  --handler src/index.handler `
  --zip-file fileb://function-encryptor.zip `
  --timeout 30 `
  --memory-size 256 `
  --region us-east-1

# Create Decryptor
aws lambda create-function `
  --function-name jose-decryptor `
  --runtime nodejs20.x `
  --role $roleArn `
  --handler src/index.handler `
  --zip-file fileb://function-decryptor.zip `
  --timeout 30 `
  --memory-size 256 `
  --region us-east-1
```

```bash
# Bash
ACCOUNT_ID="123456789012"  # Replace with your account ID
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/lambda-jwe-role"

# Wait for role to be available
sleep 10

# Create Encryptor
aws lambda create-function \
  --function-name jose-encryptor \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler src/index.handler \
  --zip-file fileb://function-encryptor.zip \
  --timeout 30 \
  --memory-size 256 \
  --region us-east-1

# Create Decryptor
aws lambda create-function \
  --function-name jose-decryptor \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler src/index.handler \
  --zip-file fileb://function-decryptor.zip \
  --timeout 30 \
  --memory-size 256 \
  --region us-east-1
```

### Step 4: Store Keys in Secrets Manager

```powershell
# PowerShell
# Store Public Key
aws secretsmanager create-secret `
  --name jose-encryptor-public-key `
  --secret-string (Get-Content keys/public.pem -Raw) `
  --region us-east-1

# Store Private Key
aws secretsmanager create-secret `
  --name jose-decryptor-private-key `
  --secret-string (Get-Content keys/private.pem -Raw) `
  --region us-east-1
```

```bash
# Bash
# Store Public Key
aws secretsmanager create-secret \
  --name jose-encryptor-public-key \
  --secret-string file://keys/public.pem \
  --region us-east-1

# Store Private Key
aws secretsmanager create-secret \
  --name jose-decryptor-private-key \
  --secret-string file://keys/private.pem \
  --region us-east-1
```

## ✅ Testing Deployment

### 1. Test Encryptor Function

```powershell
# PowerShell
$payload = @{
    payload = @{
        message = "Hello AWS!"
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
        environment = "production"
    }
}

aws lambda invoke `
  --function-name jose-encryptor `
  --payload ($payload | ConvertTo-Json) `
  response.json `
  --region us-east-1

"Response:"
Get-Content response.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

```bash
# Bash
aws lambda invoke \
  --function-name jose-encryptor \
  --payload '{
    "payload": {
      "message": "Hello AWS!",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "environment": "production"
    }
  }' \
  response.json \
  --region us-east-1

echo "Response:"
cat response.json | jq .
```

### 2. Test Decryptor Function

```powershell
# PowerShell
# First, get the encrypted JWE token from the previous test
$encryptResponse = Get-Content response.json | ConvertFrom-Json
$jweToken = $encryptResponse.body | ConvertFrom-Json | Select-Object -ExpandProperty jwe

$decryptPayload = @{
    jwe = $jweToken
}

aws lambda invoke `
  --function-name jose-decryptor `
  --payload ($decryptPayload | ConvertTo-Json) `
  decrypted-response.json `
  --region us-east-1

"Decrypted Response:"
Get-Content decrypted-response.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

```bash
# Bash
# First, get the encrypted JWE token from the previous test
JWE_TOKEN=$(cat response.json | jq -r '.body' | jq -r '.jwe')

aws lambda invoke \
  --function-name jose-decryptor \
  --payload "{\"jwe\": \"$JWE_TOKEN\"}" \
  decrypted-response.json \
  --region us-east-1

echo "Decrypted Response:"
cat decrypted-response.json | jq .
```

## 🔐 Security Best Practices

### ✅ DO
1. ✅ Store private keys in AWS Secrets Manager
2. ✅ Use IAM roles with minimal permissions
3. ✅ Enable CloudWatch logging
4. ✅ Use HTTPS for API Gateway
5. ✅ Rotate keys periodically
6. ✅ Monitor function executions in CloudWatch
7. ✅ Use resource tagging for cost tracking

### ❌ DON'T
1. ❌ Store private keys in environment variables
2. ❌ Commit private keys to Git
3. ❌ Use wildcard IAM permissions
4. ❌ Disable CloudWatch logging
5. ❌ Log sensitive data (keys, payloads)
6. ❌ Share AWS credentials in code
7. ❌ Use overly permissive security groups

## 📊 Monitoring & Troubleshooting

### View Function Logs

```powershell
# PowerShell
aws logs tail /aws/lambda/jose-encryptor --follow --region us-east-1
```

```bash
# Bash
aws logs tail /aws/lambda/jose-encryptor --follow --region us-east-1
```

### Check Function Details

```powershell
# PowerShell
aws lambda get-function --function-name jose-encryptor --region us-east-1
```

```bash
# Bash
aws lambda get-function --function-name jose-encryptor --region us-east-1
```

### View Function Configuration

```powershell
# PowerShell
aws lambda get-function-configuration --function-name jose-encryptor --region us-east-1
```

```bash
# Bash
aws lambda get-function-configuration --function-name jose-encryptor --region us-east-1
```

## 🔄 Updating Functions

### Update Code

```powershell
# PowerShell
# After making changes to code, repackage and update

cd jose-encryptor
npm install --production
Compress-Archive -Path . -DestinationPath ..\function-encryptor.zip -Force -Exclude "node_modules", ".git"
Compress-Archive -Path node_modules -DestinationPath ..\function-encryptor.zip -Update
cd ..

aws lambda update-function-code `
  --function-name jose-encryptor `
  --zip-file fileb://function-encryptor.zip `
  --region us-east-1
```

```bash
# Bash
# After making changes to code, repackage and update

cd jose-encryptor
npm install --production
zip -r -q ../function-encryptor.zip . -x "node_modules/*" ".git/*"
zip -r -q ../function-encryptor.zip node_modules/
cd ..

aws lambda update-function-code \
  --function-name jose-encryptor \
  --zip-file fileb://function-encryptor.zip \
  --region us-east-1
```

### Update Configuration

```powershell
# PowerShell
aws lambda update-function-configuration `
  --function-name jose-encryptor `
  --timeout 60 `
  --memory-size 512 `
  --environment "Variables={LOG_LEVEL=DEBUG}" `
  --region us-east-1
```

```bash
# Bash
aws lambda update-function-configuration \
  --function-name jose-encryptor \
  --timeout 60 \
  --memory-size 512 \
  --environment "Variables={LOG_LEVEL=DEBUG}" \
  --region us-east-1
```

## 🧹 Cleanup

### Delete Functions

```powershell
# PowerShell
aws lambda delete-function --function-name jose-encryptor --region us-east-1
aws lambda delete-function --function-name jose-decryptor --region us-east-1
```

```bash
# Bash
aws lambda delete-function --function-name jose-encryptor --region us-east-1
aws lambda delete-function --function-name jose-decryptor --region us-east-1
```

### Delete Secrets

```powershell
# PowerShell
aws secretsmanager delete-secret `
  --secret-id jose-encryptor-public-key `
  --force-delete-without-recovery `
  --region us-east-1

aws secretsmanager delete-secret `
  --secret-id jose-decryptor-private-key `
  --force-delete-without-recovery `
  --region us-east-1
```

```bash
# Bash
aws secretsmanager delete-secret \
  --secret-id jose-encryptor-public-key \
  --force-delete-without-recovery \
  --region us-east-1

aws secretsmanager delete-secret \
  --secret-id jose-decryptor-private-key \
  --force-delete-without-recovery \
  --region us-east-1
```

### Delete IAM Role

```powershell
# PowerShell
# First detach policies
aws iam detach-role-policy `
  --role-name lambda-jwe-role `
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole `
  --region us-east-1

# Then delete role
aws iam delete-role --role-name lambda-jwe-role --region us-east-1
```

```bash
# Bash
# First detach policies
aws iam detach-role-policy \
  --role-name lambda-jwe-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --region us-east-1

# Then delete role
aws iam delete-role --role-name lambda-jwe-role --region us-east-1
```

## 📞 Troubleshooting

### Issue: Function Execution Failed

**Solution:**
1. Check CloudWatch logs: `aws logs tail /aws/lambda/jose-encryptor`
2. Verify IAM role has proper permissions
3. Ensure keys are stored in Secrets Manager
4. Check function configuration

### Issue: "Role is invalid" error

**Solution:**
- Wait 10-15 seconds after creating IAM role before creating functions
- Verify role ARN is correct
- Check that role has the correct trust policy

### Issue: Timeout errors

**Solution:**
- Increase Lambda timeout: `aws lambda update-function-configuration --timeout 60`
- Increase memory: `aws lambda update-function-configuration --memory-size 512`
- Check for performance issues in CloudWatch logs

### Issue: Decryption fails

**Solution:**
- Verify the JWE token was created by the encryptor
- Check that private key in Secrets Manager matches public key
- Ensure no token tampering occurred

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Secrets Manager Guide](https://docs.aws.amazon.com/secretsmanager/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [JOSE RFC 7516 - JSON Web Encryption](https://tools.ietf.org/html/rfc7516)

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0
