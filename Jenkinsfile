pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')  // your DockerHub credentials in Jenkins
        EC2_USER = "ubuntu"
        EC2_HOST = "16.171.234.124"  // Web EC2 IP
        APP_PATH = "/home/ubuntu/QuoteKaro"
        IMAGE_FRONTEND = "aadarshsoni/quotekaro-frontend:latest"
        IMAGE_BACKEND  = "aadarshsoni/quotekaro-backend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/aadarsh-2004/QuoteKaro.git'
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    // Build backend image
                    sh "docker build -t $IMAGE_BACKEND ./server"
                    
                    // Build frontend image
                    sh "docker build -t $IMAGE_FRONTEND ./client"
                    
                    // Login & push
                    sh """
                        echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                        docker push $IMAGE_BACKEND
                        docker push $IMAGE_FRONTEND
                    """
                }
            }
        }

        stage('Deploy on EC2') {
            steps {
                sshagent(['jenkins-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                            cd $APP_PATH
                            docker-compose pull
                            docker-compose up -d
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished!"
        }
        failure {
            echo "Pipeline failed! Check logs."
        }
        success {
            echo "Deployment successful!"
        }
    }
}
