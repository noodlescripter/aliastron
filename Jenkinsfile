pipeline {
    agent {
        label 'build-01-win'
    }
    parameters {
        string(name: 'Branch', defaultValue: 'main', description: 'Branch to release from')
    }
    environment {
        GIT_REPO = 'git@github.com:noodlescripter/aliastron.git'
        BRANCH = "${params.Branch}"
        NPM_TOKEN = credentials('npm_dummy_token')
        PATH = "C:\\Program Files\\nodejs;${env.PATH}"  // Adjust path for your Windows node
    }
    stages {
        stage('Prepare Workspace') {
            steps {
                script {
                    // Clean workspace
                    cleanWs()
                    git branch: "${BRANCH}", url: "${GIT_REPO}"
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                // Use npm ci for clean install
                bat 'npm ci'  // Changed from 'sh' to 'bat' for Windows
            }
        }
    
        stage('Building package') {
            steps {
                // Run build script
                bat 'npm run build'  // Changed from 'sh' to 'bat' for Windows
            }
        }
        stage('Preparing NPM access') {
            steps {
                script {
                    // Create .npmrc file with token
                    writeFile file: '.npmrc', text: "//registry.npmjs.org/:_authToken=${NPM_TOKEN}"
                    // Publish to NPM
                    bat '''
                        echo NPM access prepared
                    '''  // Changed from 'sh' to 'bat' for Windows
                }
            }
        }
    }
    post {
        always {
            // Always clean workspace
            cleanWs()
        }
        success {
            echo 'Release process completed successfully!'
        }
        failure {
            echo 'Release process failed. Check logs for details.'
        }
    }
}