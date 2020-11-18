

### Enviroment Vars

|NAME  |DEFAULT_VALUE |DESCRIPTION  |
|---------|---------|---------|
|PORT     |  8080       |         |
|METRICS_URL     |         |         |
|METRICS_FILE     |         |         |


### Deploy in OpenShift
```shell

oc project brz-daisy-qa

# daisy-analysebox-instance
oc new-app --name daisy-analysebox-instance-55555002-2020011 --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-analysebox-instance.txt -l daisy_caseid=55555002-2020011

oc new-app --name daisy-analysebox-instance-55555002-2020011 --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-analysebox-instance.txt -l daisy_caseid=55555002-2020011

# daisy-casestate-webservice
oc new-app --name daisy-casestate-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-casestate-webservice.txt -l app=daisy-casestate-webservice

# daisy-cockpit-backend
oc new-app --name daisy-cockpit-backend --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-cockpit-backend.txt -l app=daisy-cockpit-backend

# daisy-digishare-webservice
oc new-app --name daisy-digishare-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -e METRICS_FILE=./metrics/daisy-digishare-webservice.txt -l app=daisy-digishare-webservice


# Expose (create route)
oc expose svc/daisy-analysebox-instance-55555002-2020011 
oc expose svc/daisy-casestate-webservice 
oc expose svc/daisy-cockpit-backend
oc expose svc/daisy-digishare-webservice

oc get all -l app=daisy-casestate-webservice

## delete 
oc delete all -l app=daisy-cockpit-backend
```

### Service Monitor
Create Service Monitor

```json
cat <<EOF | oc create -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  labels:
    app: brz-daisy-qa
  name: brz-daisy-qa-general
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
    - key: app
      operator: In
      values:
      - daisy-casestate-webservice
      - daisy-cockpit-backend
      - daisy-digishare-webservice
      - daisy-analysebox-instance
EOF
```

### Check Prometheus Target
Forward a port to the Prometheus UI. In this example, port 9090 is used:
```
oc port-forward -n openshift-user-workload-monitoring svc/prometheus-operated 9090
```
Open Prometheus UI at http://localhost:9090/targets to see the sample application being monitored.
