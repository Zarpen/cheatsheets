### Build and run the go file
```bash
#test run 
go run bon.go

# package to run: 
go build bon.go -o bongo
./bongo
```

# build docker image, deploy to kubernetes
```shell script

kubectl delete deployment.apps/api-service-3-deployment --namespace=default

eval $(minikube docker-env)
docker build -t saul/api-service-3 .
#test docker image
docker run -p 8001:8001 --rm --name=api-service-3 saul/api-service-3
docker stop <container ID>
kubectl apply -f kube/deployment.yaml
# test url on nodeport
minikube service api-service-3-service --url
# add on url 
<url>/ping
```

#logging 
```
stern -n default api-service-3 -t
```