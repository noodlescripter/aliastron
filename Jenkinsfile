pipeline {
    agent {
        any
    }
    parameters {
        string(name: 'Branch', defaultValue: 'master', description: 'Branch to release from')
    }
    environment {
        GIT_REPO = 'git@github.com:noodlescripter/aliastron.git'
        BRANCH = "${params.Branch}"
        NPM_TOKEN = credentials('npm_dummy_token')
    }
    stages {
        stage('Prepare Workspace') {
            steps {
                script {
                    // Clean workspace
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

        stage('Publishing to NPM') {
            steps {
                sh '''
                    echo "Publishing to NPM"
                    npm publish
                '''
            }
        }
    }
    post {
        success {
            echo 'Release process completed successfully!'
        }

        failure {
            echo 'Release process failed. Check logs for details.'
        }
    }
}