# AWS EC2 Deployment Guide

This guide walks you through deploying the AI Resume Builder on AWS EC2.

## Prerequisites

- AWS account
- AWS CLI configured (optional)
- SSH key pair
- Domain name (optional, for HTTPS)

## Step 1: Launch EC2 Instance

1. **Log in to AWS Console** → EC2 → Launch Instance

2. **Choose AMI**: Ubuntu Server 22.04 LTS

3. **Instance Type**: 
   - Minimum: `t3.medium` (2 vCPU, 4 GB RAM) for full stack
   - Recommended: `t3.large` (2 vCPU, 8 GB RAM) for AI Engine

4. **Key Pair**: Create or select existing .pem key

5. **Network**: 
   - Allow SSH (22) from your IP
   - Allow HTTP (80) and HTTPS (443) from 0.0.0.0/0

6. **Storage**: 30 GB gp3

7. Launch instance and note the **Public IP**

## Step 2: Connect and Install Dependencies

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
# Log out and back in for group to take effect

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 3: Clone and Configure

```bash
# Clone repository (or upload files)
git clone <your-repo-url> app
cd app

# Create environment file
cp .env.example .env
nano .env
```

**Edit .env with production values:**

```env
POSTGRES_USER=resume_user
POSTGRES_PASSWORD=<STRONG_RANDOM_PASSWORD>
POSTGRES_DB=resume_db
JWT_SECRET=<STRONG_RANDOM_SECRET>
OPENAI_API_KEY=sk-your-openai-key
ENVIRONMENT=production
DEBUG=false
```

Generate secrets:
```bash
openssl rand -hex 32
```

## Step 4: Deploy with Docker Compose

```bash
cd "AI Resume Builder with ATS Scoring System"
docker-compose up -d
```

Wait for all services to start (2-5 minutes for AI Engine model download).

## Step 5: Verify Deployment

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f backend
```

- Open http://\<EC2_PUBLIC_IP\> in browser
- API docs: http://\<EC2_PUBLIC_IP\>/api/docs

## Step 6: HTTPS with Let's Encrypt (Optional)

```bash
# Install certbot
sudo apt install certbot -y

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com
```

Update `nginx/nginx.conf` to add SSL:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # ... rest of config
}
```

Mount certs in docker-compose for nginx:
```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

## Step 7: Persistence and Backups

Data is stored in Docker volumes:
- `postgres_data` – Database
- `redis_data` – Cache

**Backup PostgreSQL:**
```bash
docker exec resume-postgres pg_dump -U resume_user resume_db > backup.sql
```

**Restore:**
```bash
docker exec -i resume-postgres psql -U resume_user resume_db < backup.sql
```

## Troubleshooting

### AI Engine slow to start
The Sentence Transformers model downloads on first run (~90MB). Wait 2-5 minutes.

### Out of memory
Increase EC2 instance size or add swap:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port 80 in use
Stop conflicting services:
```bash
sudo systemctl stop apache2  # if installed
```

### Database connection refused
Ensure PostgreSQL is healthy:
```bash
docker-compose exec postgres pg_isready -U resume_user
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Restrict SSH to your IP
- [ ] Enable HTTPS
- [ ] Set up CloudWatch for monitoring
- [ ] Configure AWS Security Groups properly
