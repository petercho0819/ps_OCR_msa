pipeline {
    agent any

    environment {
        // 필요한 환경변수 설정
        NODE_ENV = 'production'
        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                // Git 저장소에서 소스코드 가져오기
                git branch: 'main', url: 'https://github.com/petercho0819/ps_OCR_msa.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    // 의존성 설치 (선택사항, 빌드 단계에서 사용)
                    sh 'npm install --prefix apps/auth'
                    sh 'npm install --prefix apps/company'
                    sh 'npm install --prefix apps/receipt'
                }
            }
        }

        stage('Build Services') {
            steps {
                script {
                    // 각 마이크로서비스의 Docker 이미지를 빌드
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE build'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // 테스트를 수행할 수 있다면 여기에 포함
                    sh 'npm run test --prefix apps/auth'
                    sh 'npm run test --prefix apps/company'
                    sh 'npm run test --prefix apps/receipt'
                }
            }
        }

        stage('Deploy Services') {
            steps {
                script {
                    // Docker Compose로 서비스 실행
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d'
                }
            }
        }
    }

    post {
        always {
            // 빌드 후 Docker Compose 상태를 출력
            sh 'docker-compose ps'
        }
        success {
            // 빌드 성공 시 알림 등 추가 작업
            echo 'Build and Deploy Successful'
        }
        failure {
            // 빌드 실패 시 처리
            echo 'Build or Deploy Failed'
        }
    }
}
