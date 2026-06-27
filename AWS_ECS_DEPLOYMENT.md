# AWS ECS Fargate Deployment Guide

This guide covers the minute-by-step process of taking this containerized E-Commerce microservices application and deploying it to production using AWS Elastic Container Service (ECS) with AWS Fargate.

## Prerequisites
1. An AWS Account.
2. AWS CLI installed and configured on your local machine (`aws configure`).
3. Docker Desktop installed and running.

---

## Phase 1: Push Images to Elastic Container Registry (ECR)

ECR is AWS's private Docker registry. We need to store our images here so ECS can pull them.

1. **Log in to AWS Console** and navigate to **Elastic Container Registry (ECR)**.
2. **Create Repositories**: Create a private repository for each of your services:
   - `ecommerce-frontend`
   - `ecommerce-api-gateway`
   - `ecommerce-auth-service`
   - `ecommerce-product-service`
   - `ecommerce-order-service`
   - `ecommerce-notification-service`
3. **Authenticate Docker**: Open your local terminal and authenticate Docker to your ECR registry (replace `REGION` and `ACCOUNT_ID` with your actual AWS region and account ID):
   ```bash
   aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
   ```
4. **Build, Tag, and Push**: For each service, run the following commands from the root directory. Example for `frontend`:
   ```bash
   docker build -t ecommerce-frontend ./Frontend
   docker tag ecommerce-frontend:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ecommerce-frontend:latest
   docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ecommerce-frontend:latest
   ```
   *Repeat this process for all 6 services.*

---

## Phase 2: Setup Managed Infrastructure (Redis)

Instead of deploying a Redis container, use a managed AWS service for reliability. Your MongoDB is already managed via Atlas.

1. Navigate to **ElastiCache** in the AWS Console.
2. Click **Create Redis cluster**.
3. Choose **Serverless** (easier management) or **Design your own cache** (if you want specific node types).
4. Place it in your default VPC.
5. Once created, copy the **Primary Endpoint** URL. This will be your `REDIS_HOST` environment variable.

---

## Phase 3: Create the ECS Cluster

1. Navigate to **Elastic Container Service (ECS)**.
2. Click **Create cluster**.
3. Name it `ecommerce-cluster`.
4. Under Infrastructure, select **AWS Fargate** (Serverless compute).
5. Click **Create**.

---

## Phase 4: Create Task Definitions

Task Definitions act like your `docker-compose.yml`. You need one for each microservice.

1. In ECS, go to **Task definitions** and click **Create new task definition**.
2. **Name**: e.g., `auth-service-task`.
3. **Launch type**: Fargate.
4. **OS, Architecture**: Linux/X86_64.
5. **Task size**: 1 vCPU, 2 GB Memory (or less depending on the service).
6. **Container details**:
   - **Name**: `auth-service-container`
   - **Image URI**: Paste the ECR URI you pushed in Phase 1 (e.g., `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ecommerce-auth-service:latest`).
   - **Port mappings**: Add the container port (e.g., `3001` for auth-service, `80` for frontend).
7. **Environment Variables**: Add key-value pairs (e.g., `PORT=3001`, `REDIS_HOST=<ElastiCache_Endpoint>`).
   - *Security Best Practice*: For secrets like `JWT_SECRET`, store them in **AWS Systems Manager Parameter Store** as SecureStrings, and reference them here using "ValueFrom".
8. Click **Create**.
   *Repeat this for all 6 services. Ensure the Frontend uses Port 80, and API Gateway uses Port 3000.*

---

## Phase 5: Setup Application Load Balancer (ALB)

The ALB routes incoming internet traffic to your containers.

1. Navigate to the **EC2 Dashboard** > **Load Balancers** > **Create Load Balancer**.
2. Select **Application Load Balancer**.
3. **Name**: `ecommerce-alb`.
4. **Scheme**: Internet-facing.
5. **Network mapping**: Select your default VPC and check all Availability Zones.
6. **Security Groups**: Create a new security group allowing inbound HTTP (Port 80) and HTTPS (Port 443) from anywhere (`0.0.0.0/0`).
7. **Listeners and Routing**: 
   - We need a **Target Group** to send traffic to. Click "Create target group".
   - Target type: **IP addresses** (Required for Fargate).
   - Protocol/Port: HTTP/80. Name: `frontend-tg`.
   - Create the target group and go back to the ALB creation page to select it.
8. Create the Load Balancer.

### Add a routing rule for API Gateway:
1. Go to your new ALB's **Listeners** tab. Click the HTTP:80 listener to manage rules.
2. Add a rule: If `Path` is `/api/*`, forward to a **new Target Group** (Create one called `api-gateway-tg`, type: IP addresses, Port 3000).

---

## Phase 6: Service Discovery (AWS Cloud Map)

Your API Gateway needs to find the internal microservices using names like `http://auth-service:3001`.

1. Go to **AWS Cloud Map**.
2. Create a namespace. Name it something like `ecommerce.local`.
3. This allows your internal containers to resolve DNS requests for each other.

---

## Phase 7: Create ECS Services

Now we run the Task Definitions permanently.

1. Go to your `ecommerce-cluster` in ECS. Under the **Services** tab, click **Create**.
2. **Compute Options**: Launch type > Fargate.
3. **Deployment configuration**:
   - Family: Select your Task Definition (e.g., `auth-service-task`).
   - Service name: `auth-service`.
   - Desired tasks: `1` or `2`.
4. **Networking**: 
   - Select your default VPC subnets.
   - **Security Group**: Create a new one. **Crucial Step:** Allow inbound traffic on the service's port (e.g., 3001) ONLY from the other container security groups or the ALB security group.
5. **Service Connect / Service Discovery**: Enable Service Discovery. Use the `ecommerce.local` namespace created in Phase 6. Name the service `auth-service`. (This makes `http://auth-service.ecommerce.local:3001` resolvable!).
6. **Load Balancing** (Only for Frontend and API Gateway):
   - For the Frontend service, select your ALB and the `frontend-tg` target group.
   - For the API Gateway service, select your ALB and the `api-gateway-tg` target group.
7. Click **Create**.
   *Repeat this for all 6 services. Remember, only Frontend and API Gateway get attached to the Load Balancer. The others just need Service Discovery enabled.*

---

## Phase 8: Updating the API Gateway Code

Since your Cloud Map namespace is `ecommerce.local`, you need to update your API Gateway environment variables to point to the new DNS names:
- `AUTH_SERVICE_URL=http://auth-service.ecommerce.local:3001`
- `ORDER_SERVICE_URL=http://order-service.ecommerce.local:3003`
- `PRODUCT_SERVICE_URL=http://product-service.ecommerce.local:3002`

Update your API Gateway Task Definition with these new environment variables and restart the API Gateway service.

---

## Phase 9: Go Live!

1. Go to the **EC2 Dashboard** > **Load Balancers**.
2. Copy the **DNS Name** of your ALB (e.g., `ecommerce-alb-12345.region.elb.amazonaws.com`).
3. Paste it into your browser.

**Congratulations! Your E-Commerce application is now running securely and highly available on AWS ECS Fargate.** 

*Next Steps: Map a custom domain name to your ALB using AWS Route53 and set up an SSL certificate using AWS Certificate Manager for HTTPS.*
