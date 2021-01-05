DOCKER_REGISTRY_NAME?=deliverairegistry
DOCKER_REGISTRY_URI?=${DOCKER_REGISTRY_NAME}.azurecr.io
COMMIT_ID?=$(shell git rev-parse --short HEAD)
IMAGE_TAG?=v1-${COMMIT_ID}
NAMESPACE?=deliverai
HELM_RELEASE_NAME?=order-app
CHART_FOLDER?=k8s/${HELM_RELEASE_NAME}

.PHONY: docker docker-registry-login

TARGET_ACTION := $(firstword $(MAKECMDGOALS))
ifeq ($(TARGET_ACTION),$(filter $(TARGET_ACTION),docker deploy))
  TARGET_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval $(TARGET_ARGS):;@:)
  ENVIRONMENT := $(word 1, $(TARGET_ARGS))
endif

ifeq ($(ENVIRONMENT),prod)
  KUBE_CONTEXT := deliverai-prod-me-01
else
  KUBE_CONTEXT := deliverai-dev-ne-01
endif

init:
	yarn install --frozen-lockfile

lint:
	yarn lint

test:
	yarn test

docker-registry-login:
ifeq ($(CI),true)
	@set +x; docker login -u $(DOCKER_PRIVATE_REGISTRY_USER) -p "$(DOCKER_PRIVATE_REGISTRY_PASSWORD)" $(DOCKER_PRIVATE_REGISTRY_SERVER)
else
	az acr login --name ${DOCKER_REGISTRY_NAME}
endif

docker: docker-registry-login
	docker build . --build-arg ENVIRONMET_ARG=$(ENVIRONMENT) \
    -t ${DOCKER_REGISTRY_URI}/apps/${HELM_RELEASE_NAME}:${IMAGE_TAG} \
    -f Dockerfile && \
    docker push ${DOCKER_REGISTRY_URI}/apps/${HELM_RELEASE_NAME}:${IMAGE_TAG}

deploy:
	helm upgrade ${HELM_RELEASE_NAME} ${CHART_FOLDER} \
    --kube-context $(KUBE_CONTEXT) \
    --atomic \
    --install \
    --timeout 10m \
    --cleanup-on-fail \
    --namespace ${NAMESPACE} \
    --values ${CHART_FOLDER}/values/values-$(ENVIRONMENT).yaml \
    --set image.tag=${IMAGE_TAG} \
    --description "release=${IMAGE_TAG}" \
    || exit 3
