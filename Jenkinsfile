pipeline {
    agent {
      kubernetes {
        cloud 'deliverai-shared'
        yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    env: deliverai-shared
spec:
  containers:
  - name: node-ci
    image: deliverairegistry.azurecr.io/images/node-ci:node-12.18.2-buster-slim
    command:
    - cat
    tty: true

  - name: swissknife
    image: deliverairegistry.azurecr.io/images/swissknife:v1.0.0
    command:
    - cat
    tty: true
    env:
    - name: KUBECONFIG
      value: /kubeconfig/config
    volumeMounts:
    - name: kubeconfig
      mountPath: /kubeconfig
      readOnly: true

  - name: docker-dind
    image: deliverairegistry.azurecr.io/images/docker-ci:docker-19.03.13-dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_HOST
      value: tcp://127.0.0.1:2375
    - name: DOCKER_TLS_CERTDIR
      value: ''
    envFrom:
    - secretRef:
        name: registry-creds-acr
    command:
    - "dockerd-entrypoint.sh"
    tty: false

  volumes:
  - name: kubeconfig
    secret:
      secretName: kubeconfig
  tolerations:
  - key: "kubernetes.azure.com/scalesetpriority"
    operator: "Equal"
    value: "spot"
    effect: "NoSchedule"
"""
    }
  }

  parameters {
    booleanParam(name: 'DEPLOY_TO_DEV', defaultValue: false, description: 'Deploy to development')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip Tests')
  }

  stages {
    stage('pre-build') {
      steps{
        script {
          timeout(time: 5, unit: 'MINUTES') {
            checkout scm
          }
        }
      }
    }

    stage('init') {
      steps{
        script {
          container('node-ci') {
            sh 'make init'
          }
        }
      }
    }

    stage('lint') {
      when {
        expression { !params.SKIP_TESTS }
      }
      steps{
        script {
          container('node-ci') {
            sh 'make lint'
          }
        }
      }
    }

    stage('build-image') {
      when {
        anyOf {
          expression { BRANCH_NAME ==~ /(master|develop)/ }
          expression { params.DEPLOY_TO_DEV }
        }
      }
      steps {
        script {
          if (env.BRANCH_NAME != 'master' && (env.BRANCH_NAME == 'develop' || params.DEPLOY_TO_DEV)){
            container('docker-dind') {
              sh 'make docker dev'
            }
          } else {
            container('docker-dind') {
              sh 'make docker prod'
            }
          }
        }
      }
    }


    stage('deploy'){
      when {
        anyOf {
          expression { BRANCH_NAME ==~ /(master|develop)/ }
          expression { params.DEPLOY_TO_DEV }
        }
      }
      steps {
        script {
          if (env.BRANCH_NAME != 'master' && (env.BRANCH_NAME == 'develop' || params.DEPLOY_TO_DEV)){
            container('swissknife') {
              sh 'make deploy dev'
            }
          } else {
            container('swissknife') {
              sh 'make deploy prod'
            }
          }
        }
      }
    }
  }
}
