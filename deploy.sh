#!/bin/bash

# AWS Lambda Deployment Script for JWE Functions
# Usage: ./deploy.sh <aws-region> <account-id>

set -e

REGION=${1:-us-east-1}
ACCOUNT_ID=${2:?Error: Please provide AWS Account ID}
ROLE_NAME="lambda-jwe-role"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo "🚀 Deploying JOSE Lambda Functions to AWS"
echo "   Region: $REGION"
echo "   Account: $ACCOUNT_ID"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create IAM Role
echo -e "${BLUE}[Step 1/6]${NC} Creating IAM Lambda Execution Role..."
TRUST_POLICY='{
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
}'

if aws iam get-role --role-name "$ROLE_NAME" --region "$REGION" 2>/dev/null; then
  echo "   Role already exists: $ROLE_ARN"
else
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST_POLICY" \
    --region "$REGION" || echo "   ⚠️  Role creation may have failed (may already exist)"
  
  # Attach basic Lambda execution policy
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    --region "$REGION"
  
  echo "   ✅ Role created: $ROLE_ARN"
fi

# Wait for role to be available
echo "   Waiting for role to be available..."
sleep 10

# Step 2: Package Encryptor
echo ""
echo -e "${BLUE}[Step 2/6]${NC} Packaging jose-encryptor..."
cd jose-encryptor
rm -f ../function-encryptor.zip
zip -r -q ../function-encryptor.zip . -x "node_modules/*" ".git/*"
[ ! -d "node_modules" ] && npm install --production > /dev/null 2>&1
zip -r -q ../function-encryptor.zip node_modules/
cd ..
echo "   ✅ Package created: function-encryptor.zip"

# Step 3: Package Decryptor
echo ""
echo -e "${BLUE}[Step 3/6]${NC} Packaging jose-decryptor..."
cd jose-decryptor
rm -f ../function-decryptor.zip
zip -r -q ../function-decryptor.zip . -x "node_modules/*" ".git/*"
[ ! -d "node_modules" ] && npm install --production > /dev/null 2>&1
zip -r -q ../function-decryptor.zip node_modules/
cd ..
echo "   ✅ Package created: function-decryptor.zip"

# Step 4: Deploy Encryptor
echo ""
echo -e "${BLUE}[Step 4/6]${NC} Deploying jose-encryptor function..."
if aws lambda get-function --function-name jose-encryptor --region "$REGION" 2>/dev/null; then
  echo "   Updating existing function..."
  aws lambda update-function-code \
    --function-name jose-encryptor \
    --zip-file fileb://function-encryptor.zip \
    --region "$REGION" > /dev/null
  echo "   ✅ Function updated: jose-encryptor"
else
  echo "   Creating new function..."
  aws lambda create-function \
    --function-name jose-encryptor \
    --runtime nodejs20.x \
    --role "$ROLE_ARN" \
    --handler src/index.handler \
    --zip-file fileb://function-encryptor.zip \
    --timeout 30 \
    --memory-size 256 \
    --region "$REGION" > /dev/null
  echo "   ✅ Function created: jose-encryptor"
fi

# Step 5: Deploy Decryptor
echo ""
echo -e "${BLUE}[Step 5/6]${NC} Deploying jose-decryptor function..."
if aws lambda get-function --function-name jose-decryptor --region "$REGION" 2>/dev/null; then
  echo "   Updating existing function..."
  aws lambda update-function-code \
    --function-name jose-decryptor \
    --zip-file fileb://function-decryptor.zip \
    --region "$REGION" > /dev/null
  echo "   ✅ Function updated: jose-decryptor"
else
  echo "   Creating new function..."
  aws lambda create-function \
    --function-name jose-decryptor \
    --runtime nodejs20.x \
    --role "$ROLE_ARN" \
    --handler src/index.handler \
    --zip-file fileb://function-decryptor.zip \
    --timeout 30 \
    --memory-size 256 \
    --region "$REGION" > /dev/null
  echo "   ✅ Function created: jose-decryptor"
fi

# Step 6: Store Keys in Secrets Manager
echo ""
echo -e "${BLUE}[Step 6/6]${NC} Storing encryption keys in AWS Secrets Manager..."
if aws secretsmanager describe-secret --secret-id jose-encryptor-public-key --region "$REGION" 2>/dev/null; then
  echo "   Updating existing secret: jose-encryptor-public-key"
  aws secretsmanager update-secret \
    --secret-id jose-encryptor-public-key \
    --secret-string file://keys/public.pem \
    --region "$REGION" > /dev/null
else
  echo "   Creating new secret: jose-encryptor-public-key"
  aws secretsmanager create-secret \
    --name jose-encryptor-public-key \
    --secret-string file://keys/public.pem \
    --region "$REGION" > /dev/null
fi

if aws secretsmanager describe-secret --secret-id jose-decryptor-private-key --region "$REGION" 2>/dev/null; then
  echo "   Updating existing secret: jose-decryptor-private-key"
  aws secretsmanager update-secret \
    --secret-id jose-decryptor-private-key \
    --secret-string file://keys/private.pem \
    --region "$REGION" > /dev/null
else
  echo "   Creating new secret: jose-decryptor-private-key"
  aws secretsmanager create-secret \
    --name jose-decryptor-private-key \
    --secret-string file://keys/private.pem \
    --region "$REGION" > /dev/null
fi
echo "   ✅ Secrets stored in AWS Secrets Manager"

# Cleanup
echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Functions deployed:"
echo "  - jose-encryptor: Ready for encryption operations"
echo "  - jose-decryptor: Ready for decryption operations"
echo ""
echo "Testing the functions:"
echo ""
echo "Test Encryptor:"
echo "  aws lambda invoke \\
    --function-name jose-encryptor \\
    --payload '{\"payload\":{\"message\":\"test\"}}' \\
    response.json \\
    --region $REGION"
echo ""
echo "Test Decryptor:"
echo "  aws lambda invoke \\
    --function-name jose-decryptor \\
    --payload '{\"jwe\":\"<encrypted-token>\"}' \\
    response.json \\
    --region $REGION"
echo ""
echo "Cleanup temporary files:"
echo "  rm -f function-encryptor.zip function-decryptor.zip"
