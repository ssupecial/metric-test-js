import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'
import * as http from 'http';
import { EC2Client, GetInstanceMetadataDefaultsCommand } from "@aws-sdk/client-ec2";


// const getInstanceId = (): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const options = {
//       hostname: '169.254.169.254',
//       path: '/latest/meta-data/instance-id',
//       method: 'GET',
//       timeout: 1000,
//     };

//     const req = http.request(options, (res) => {
//       let data: string = '';
//       res.on('data', (chunk: Buffer) => {
//         data += chunk.toString();
//       });
//       res.on('end', () => {
//         resolve(data);
//       });
//     });

//     req.on('error', (error: Error) => {
//       console.error(error);
//       reject(error);
//     });

//     req.end();
//   });
// };

const getInstanceId = async () => {
  const client = new EC2Client({ region: "ap-northeast-2" });
  const input = {
    DryRun: true
  }
  const command = new GetInstanceMetadataDefaultsCommand(input);
  try {
    const response = await client.send(command);
    console.log(response)
  }
  catch (e) {
    console.error(e)
  }

}

const startMetricsExporter = async () => {
  // const instanceId = await getInstanceId()
  getInstanceId()
  // // const instanceId = metadata.instanceId;
  // const options = {
  //   url:
  //     'http://' + "localhost:4318" + '/v1/metrics', // Grafana Agent Metric을 받는 url
  //   headers: {},
  //   concurrencyLimit: 5
  // }
  // const exporter = new OTLPMetricExporter(options)
  
  // console.log('instanceId:', instanceId)

  // const resource = new Resource({
  //   [SemanticResourceAttributes.SERVICE_NAME]: 'backend-admin-metric',
  //   [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  //   [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: instanceId,
  //   environment: 'production' // 사용자 정의 속성
  // })

  // // Creates MeterProvider and installs the exporter as a MetricReader
  // const meterProvider = new MeterProvider({
  //   resource: resource
  // })
  // meterProvider.addMetricReader(
  //   new PeriodicExportingMetricReader({
  //     exporter,
  //     exportIntervalMillis: 1000
  //   })
  // )

  // const hostMetrics = new HostMetrics({
  //   meterProvider,
  //   name: 'backend-admin-host-metric'
  // })
  // hostMetrics.start()
}

export default startMetricsExporter
