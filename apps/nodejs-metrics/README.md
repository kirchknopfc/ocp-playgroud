# NodeJs metrics sample application


### Deploy in OpenShift
```shell
# Create App
oc new-app --name nodejs-metrics -i nodejs:latest https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080

# Expose (create route)
oc expose svc/weather

```
