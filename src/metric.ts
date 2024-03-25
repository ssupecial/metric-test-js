import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'
import os from 'os'
import * as https from 'https';
import { get } from 'http'
import * as dotenv from 'dotenv'

// const getMetadataToken = (): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const options = {
//       method: 'PUT',
//       hostname: '169.254.169.254',
//       path: '/latest/api/token',
//       headers: {
//         'X-aws-ec2-metadata-token-ttl-seconds': '21600', // 토큰 유효 시간(초)
//       },
//       timeout: 1000, // 요청 타임아웃
//     };

//     const req = https.request(options, (res) => {
//       let data = '';
//       res.on('data', (chunk) => {
//         data += chunk;
//       });
//       res.on('end', () => {
//         resolve(data); // 토큰 반환
//       });
//     });

//     req.on('error', (error) => {
//       console.error(error);
//       reject(error);
//     });

//     req.end();
//   });
// };

const getInstanceId = (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '169.254.169.254',
      path: '/latest/meta-data/instance-id',
      headers: {
        'X-aws-ec2-metadata-token': token
      },
      method: 'GET',
      timeout: 1000,
    };

    const req = https.request(options, (res) => {
      let data: string = '';
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error: Error) => {
      console.error(error);
      reject(error);
    });

    req.end();
  });
};

const startMetricsExporter = async () => {
  // const token = await getMetadataToken()
  const token = process.env.TOKEN
  console.log('token:', token)
  const instanceId = await getInstanceId(token)
  const options = {
    url:
      'http://' + "localhost" + '/v1/metrics', // Grafana Agent Metric을 받는 url
    headers: {},
    concurrencyLimit: 5
  }
  const exporter = new OTLPMetricExporter(options)
  
  console.log('instanceId:', instanceId)

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'backend-admin-metric',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: instanceId,
    environment: 'production' // 사용자 정의 속성
  })

  // Creates MeterProvider and installs the exporter as a MetricReader
  const meterProvider = new MeterProvider({
    resource: resource
  })
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: 1000
    })
  )

  const hostMetrics = new HostMetrics({
    meterProvider,
    name: 'backend-admin-host-metric'
  })
  hostMetrics.start()
}

export default startMetricsExporter
