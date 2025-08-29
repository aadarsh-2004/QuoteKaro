pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('6f9871c2-58b0-40db-8038-3b3c0872b6e0')
        EC2_USER = "ubuntu"
        EC2_HOST = "16.171.234.124"
        APP_PATH = "/home/ubuntu/QuoteKaro"
        IMAGE_FRONTEND = "yourdockerhubuser/quotekaro-frontend"
        IMAGE_BACKEND  = "yourdockerhubuser/quotekaro-backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/aadarsh-2004/QuoteKaro.git'
            }
        }

        stage('Build & Push Docker Images on EC2') {
            steps {
                sshagent(['jenkins-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                            cd $APP_PATH
                            
                            # Login to Docker Hub
                            echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                            
                            # Build Docker images
                            docker build -t $IMAGE_BACKEND ./server
                            docker build -t $IMAGE_FRONTEND ./client
                            
                            # Push to Docker Hub
                            docker push $IMAGE_BACKEND
                            docker push $IMAGE_FRONTEND
                        '
                    """
                }
            }
        }

        stage('Deploy via Docker Compose on EC2') {
            steps {
                sshagent(['jenkins-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                            cd $APP_PATH
                            docker-compose pull
                            docker-compose up -d --build
                        '
                    """
                }
            }
        }
    }
}
