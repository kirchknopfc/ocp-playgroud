

### Enviroment Vars

|NAME  |DEFAULT_VALUE |DESCRIPTION  |
|---------|---------|---------|
|PORT     |  8080       |         |
|METRICS_URL     |         |         |
|METRICS_FILE     |         |         |


### Deploy in OpenShift
```shell

oc new-project brz-daisy-demo

# daisy-analysebox-instance
oc new-app --name daisy-analysebox-instance-55555002-2020011 --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-analysebox-instance.txt -l daisy_caseid=55555002-2020011

oc new-app --name daisy-analysebox-instance-55555003-2020323 --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-analysebox-instance.txt -l daisy_caseid=55555003-2020323

# daisy-casestate-webservice
oc new-app --name daisy-casestate-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-casestate-webservice.txt -l app=daisy-casestate-webservice

# daisy-cockpit-backend
oc new-app --name daisy-cockpit-backend --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-cockpit-backend.txt -l app=daisy-cockpit-backend

# daisy-digishare-webservice
oc new-app --name daisy-digishare-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-digishare-webservice.txt -l app=daisy-digishare-webservice


# no metrics
oc new-app --name daisy-cockpit --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE= -l app=daisy-cockpit

oc new-app --name ner-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE= -l app=ner-webservice

oc new-app --name pdf-conversion-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE= -l app=pdf-conversion-webservice

oc new-app --name text-extraction-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE= -l app=text-extraction-webservice


#postgress
oc new-app --name daisy-postgres-exporter --docker-image=wrouesnel/postgres_exporter -e DATA_SOURCE_NAME=postgresql://bisportaladmin@bisportal-test-db:252C3FCzVx3EuS41pX9B@bisportal-test-db.postgres.database.azure.com:5432/postgres -l app=daisy-postgres-exporter


# Expose (create route)
oc expose svc/daisy-analysebox-instance-55555002-2020011 
oc expose svc/daisy-analysebox-instance-55555003-2020323
oc expose svc/daisy-casestate-webservice 
oc expose svc/daisy-cockpit-backend
oc expose svc/daisy-digishare-webservice
oc expose svc/daisy-postgres-exporter

oc expose svc/daisy-cockpit

oc get deployment --show-labels daisy_deployversion

oc label deployment daisy-casestate-webservice daisy_deployversion=1.1.3 --overwrite
oc label deployment daisy-casestate-webservice daisy_deployversion=1.1.3 --overwrite


# Set daisy_deployversion Lable
oc label statefulset/daisy-analysebox-instance-11110-201209 daisy_deployversion=1.1.23 --overwrite
oc label statefulset/daisy-analysebox-instance-11111-201209 daisy_deployversion=1.1.23 --overwrite
oc label statefulset/daisy-analysebox-instance-11112-201209 daisy_deployversion=1.1.23 --overwrite
oc label statefulset/daisy-analysebox-instance-9999-201209 daisy_deployversion=1.1.23 --overwrite

# daisy components
oc label deployment daisy-casestate-webservice daisy_deployversion=1.1.23 --overwrite
oc label deployment daisy-cockpit daisy_deployversion=1.1.23 --overwrite
oc label deployment daisy-cockpit-backend daisy_deployversion=1.1.23 --overwrite
oc label deployment daisy-digishare-webservice daisy_deployversion=1.1.23 --overwrite
oc label deployment ner-webservice daisy_deployversion=1.1.8 --overwrite
oc label deployment pdf-conversion-webservice daisy_deployversion=1.1.8 --overwrite
oc label deployment text-extraction-webservice daisy_deployversion=1.1.8 --overwrite

# expoter
oc label deployment daisy-postgres-exporter daisy_deployversion=0.8 --overwrite
oc label deployment daisy-postgres-exporter daisy_deployversion=0.1 --overwrite


oc get all -l app=daisy-casestate-webservice

## delete 
oc delete all -l app=daisy-cockpit-backend
oc delete all -l app=daisy-digishare-webservice
oc delete all -l app=daisy-casestate-webservice
```

### Service Monitor
Create Service Monitor

```json
cat <<EOF | oc create -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  labels:
    app: brz-daisy-demo
  name: brz-daisy-general
spec:
  endpoints:
  - interval: 30s
    path: /actuator/prometheus
    port: 8080-tcp
    scheme: http
    tlsConfig:
      insecureSkipVerify: true
  namespaceSelector:
    matchNames:
      - brz-daisy-demo
  selector:
    matchExpressions:
    - key: app
      operator: In
      values:
      - daisy-casestate-webservice
      - daisy-cockpit-backend
      - daisy-digishare-webservice
      - daisy-analysebox-instance
EOF
```
```json
cat <<EOF | oc create -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  labels:
    app: brz-daisy-qa
  name: brz-daisy-qa-caseid
spec:
  endpoints:
  - interval: 30s
    path: /actuator/prometheus
    port: 8080-tcp
    scheme: http
    tlsConfig:
      insecureSkipVerify: true
  namespaceSelector:
    matchNames:
      - brz-daisy-dev
  selector:
    matchExpressions:
      - key: daisy_caseid
        operator: Exists
EOF
```



### Check Prometheus Target
Forward a port to the Prometheus UI. In this example, port 9090 is used:
```
oc port-forward -n openshift-user-workload-monitoring svc/prometheus-operated 9090
```
Open Prometheus UI at http://localhost:9090/targets to see the sample application being monitored.
