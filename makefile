OWNER=graphql
IMAGE_NAME=event-store
QNAME=$(OWNER)/$(IMAGE_NAME)

TAG=$(QNAME):`echo $(TRAVIS_BRANCH) | sed 's/master/latest/;s/develop/unstable/'`

lint:
	docker run -it --rm -v "$(PWD)/Dockerfile:/Dockerfile:ro" redcoolbeans/dockerlint

build:
	docker build -t $(TAG) .

login:
	@docker login -u "$(DOCKER_USER)" -p "$(DOCKER_PASS)"
push: login
	docker push $(TAG)
