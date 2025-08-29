pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        IMAGE_FRONTEND = "yourdockerhubuser/quotekaro-frontend"
        IMAGE_BACKEND  = "yourdockerhubuser/quotekaro-backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/aadarsh-2004/QuoteKaro.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_BACKEND ./server'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_FRONTEND ./client'
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push $IMAGE_BACKEND
                    docker push $IMAGE_FRONTEND
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@<EC2_IP> '
                    docker pull $IMAGE_BACKEND
                    docker pull $IMAGE_FRONTEND
                    docker compose -f ~/QuoteKaro/docker-compose.yml up -d --build
                    '
                '''
            }
        }
    }
}
