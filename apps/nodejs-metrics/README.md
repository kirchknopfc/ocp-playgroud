# NodeJs metrics sample application


### Enviroment Vars

|NAME  |DEFAULT_VALUE |DESCRIPTION  |
|---------|---------|---------|
|PORT     |  8080       |         |
|METRICS_URL     |         |         |
|METRICS_FILE     |         |         |


### Deploy in OpenShift
```shell
# Create App
oc new-app --name daisy-casestate-webservice --strategy=source --image-stream nodejs:latest --code https://github.com/kirchknopfc/ocp-playgroud/ --context-dir=/apps/nodejs-metrics -e PORT=8080 -l app=daisy-casestate-webservice

# Expose (create route)
oc expose svc/daisy-casestate-webservice

oc get all -l app=daisy-casestate-webservice

## delete 
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
EOF
```

### Check Prometheus Target
Forward a port to the Prometheus UI. In this example, port 9090 is used:
```
oc port-forward -n openshift-user-workload-monitoring svc/prometheus-operated 9090
```
Open Prometheus UI at http://localhost:9090/targets to see the sample application being monitored.