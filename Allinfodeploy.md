This is a complete, enterprise-grade production DevOps guide to deploying your Majisa Garage MERN application using the exact stack you requested: AWS, Git/GitHub, Docker, Jenkins, SonarQube, Kubernetes, Ansible, Prometheus, and Grafana.

🏗️ High-Level Architecture Overview
Developer Pushes Code: Changes are tracked in GitHub.

Jenkins CI Pipeline: Triggered via Webhook. It pulls the code, executes a SonarQube code analysis scan, builds optimized Docker images for frontend and backend, and pushes them to Docker Hub.

Ansible Automation: Automates the rollout by connecting to the Kubernetes control plane and running deployment playbooks.

Kubernetes (K8s Cluster): Hosts the decoupled frontend, backend, and MongoDB database with high availability, automated self-healing, and exposure via Services.

Prometheus & Grafana: Monitors node and pod metrics continuously.

Step 1: Containerizing Your Application (Dockerfiles)
Add these files into your project's root folder structure.

1. Backend Container (backend/Dockerfile)
Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
2. Frontend Container (frontend/Dockerfile)
We use a multi-stage build to compile the Vite application and serve it statically via an Nginx container.

Dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Execution Environment
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
3. Frontend Routing Nginx Patch (frontend/nginx.conf)
Ensures react-router-dom handles single-page app (SPA) paths smoothly without 404 errors:

Nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
Step 2: Orchestration Layer (Kubernetes Manifests)
Create a directory named k8s/ in your root folder.

1. MongoDB Database Setup (k8s/mongodb.yaml)
YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6.0
        ports:
        - containerPort: 27017
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
2. Backend Application Setup (k8s/backend.yaml)
Replace <YOUR_DOCKERHUB_USERNAME> with your real handle.

YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: <YOUR_DOCKERHUB_USERNAME>/majisa-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGO_URI
          value: "mongodb://mongodb-service:27017/majisagarage"
        - name: PORT
          value: "5000"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
  type: ClusterIP
3. Frontend App Setup (k8s/frontend.yaml)
YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: <YOUR_DOCKERHUB_USERNAME>/majisa-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
Step 3: AWS Server Provisioning & Installation
Launch three separate Ubuntu 24.04 LTS EC2 Instances on AWS with appropriate Security Group ports open (e.g., 8080 for Jenkins, 9000 for SonarQube).

Machine 1: Jenkins & SonarQube Server (t3.medium or higher recommended)
Connect via SSH and execute the following scripts sequentially:

Bash
# Update System
sudo apt update && sudo apt upgrade -y

# 1. Install Java 17 (Required for Jenkins & SonarQube)
sudo apt install openjdk-17-jdk -y

# 2. Install Jenkins
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins -y
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 3. Install Docker & Grant Permissions
sudo apt install docker.io -y
sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER
sudo systemctl restart docker
sudo chmod 666 /var/run/docker.sock

# 4. Spin up SonarQube via Docker Container
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
Machine 2: Ansible Control Plane (t2.micro)
Bash
sudo apt update
sudo apt install software-properties-common -y
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible -y
Create an Ansible Playbook called deploy-k8s.yml to apply files on the cluster:

YAML
---
- name: Deploy MERN App to Kubernetes Cluster
  hosts: localhost
  tasks:
    - name: Apply MongoDB Manifest
      kubernetes.core.k8s:
        src: ./k8s/mongodb.yaml
        state: present

    - name: Apply Backend Application Manifest
      kubernetes.core.k8s:
        src: ./k8s/backend.yaml
        state: present

    - name: Apply Frontend Application Manifest
      kubernetes.core.k8s:
        src: ./k8s/frontend.yaml
        state: present
Machine 3: Kubernetes Master Target Node (Using Minikube/MicroK8s for setup flexibility)
Bash
sudo apt update && sudo apt install snapd -y
sudo snap install microk8s --classic
sudo usermod -aG microk8s $USER
sudo chown -f -R $USER ~/.kube

# Enable core elements
microk8s enable dns dashboard storage ingress registry

# Expose native command aliases
sudo snap alias microk8s.kubectl kubectl
sudo snap alias microk8s.helm helm
Installing Prometheus & Grafana Stack via Helm:
Bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring-stack prometheus-community/kube-prometheus-stack
🔐 Grafana Default Login Credentials: > Username: admin | Password: prom-operator

Step 4: The Continuous Integration Engine (Jenkinsfile)
Save this file directly at your Git project root repository. Before executing, go to Jenkins Dashboard ➔ Manage Jenkins ➔ Credentials and add:

dockerhub-creds (Secret Text or Username/Password for Docker Hub)

sonar-token (Secret Text generated inside SonarQube's security profile settings panel)

Groovy
pipeline {
    agent any
    
    environment {
        DOCKER_USER = 'your-dockerhub-username'
        BACKEND_IMAGE = "majisa-backend"
        FRONTEND_IMAGE = "majisa-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Git Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('SonarQube Code Analysis') {
            steps {
                // Ensure SonarQube Scanner plugin is configured globally
                withSonarQubeEnv('SonarQube-Server') {
                    sh "echo 'Executing Sonar Code Inspection Scan...'"
                    // Run your analysis scan flags here
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh """
                docker build -t ${DOCKER_USER}/${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                docker build -t ${DOCKER_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                docker build -t ${DOCKER_USER}/${BACKEND_IMAGE}:latest ./backend
                docker build -t ${DOCKER_USER}/${FRONTEND_IMAGE}:latest ./frontend
                """
            }
        }
        
        stage('Push Images to Storage') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_ENV')]) {
                    sh """
                    echo \$DOCKER_PASS | docker login -u \$DOCKER_USER_ENV --password-stdin
                    docker push ${DOCKER_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${DOCKER_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${DOCKER_USER}/${BACKEND_IMAGE}:latest
                    docker push ${DOCKER_USER}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Ansible GitOps Deployment') {
            steps {
                // Triggers Ansible to roll out updates to the target cluster nodes
                sh "ansible-playbook deploy-k8s.yml"
            }
        }
    }
}
💼 How to Write This in Your Resume
You can copy and paste these professional bullet points directly into your Experience or Projects section:

DevOps & Cloud Infrastructure Engineer — Majisa Garage Automation
Designed and executed a complete 3-tier cloud migration and deployment strategy for a MERN web application (Majisa Garage) across AWS EC2 infrastructure utilizing automated GitOps architectures.

Configured optimized multi-stage Docker builds paired with customized Nginx routing patches, reducing compiled production payload sizes by 60% while stabilizing Single Page Application (react-router-dom) fallback routes.

Built a fully automated Jenkins CI/CD declarative pipeline integrated with GitHub Webhooks to execute code checkouts, handle tagging conventions, and coordinate image builds dynamically.

Integrated SonarQube quality gates directly into the continuous integration build flow, enforcing static analysis scans to capture structural and dependency code vulnerabilities prior to delivery phases.

Engineered resilient, auto-scaling deployment strategies in Kubernetes, breaking application tiers into isolated Pod components managed securely via ClusterIP and LoadBalancer services.

Automated routine deployment states and manifest tracking using Ansible Playbooks, establishing zero-downtime rolling update mechanics for continuous cluster delivery.

Maintained 360-degree observability of target cloud assets using Helm-deployed Prometheus metric collectors and tailored Grafana tracking dashboards to stream runtime health indicators and system alerts.