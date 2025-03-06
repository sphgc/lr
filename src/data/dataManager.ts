export interface WSDataRequest {
  id: string;
  query: QueryRequest;
}

export interface QueryRequest {
  limit: number;
  metrics: Metric[];
  start_relative: StartRelative;
}

export interface Metric {
  aggregators: Aggregator[];
  name: string;
  exclude_tags: boolean;
  group_by: any[];
  tags: Tags;
}

export interface Aggregator {
  name: string;
  align_start_time: boolean;
  sampling: Sampling;
}

export interface Sampling {
  value: number;
  unit: string;
}

export interface Tags {
  dataChannel: string[];
}

export interface StartRelative {
  value: number;
  unit: string;
}

export interface WSResponse {
  queries: QueryResponse[];
}

export interface QueryResponse {
  results: Result[];
  dataChannel: DataChannel;
}

export interface Result {
  name: string;
  values: number[][];
}

export interface DataChannel {
  dataType: string;
  deviceSerialNumber: string;
  deviceUuid: string;
  firstMeasurementTime: string;
  lastMeasurementTime: string;
  deviceProductCode: string;
  loggerName: string;
  sensorSerialNumber: string;
  sensorLabel: string;
  sensor_key: number;
  sensor_keys: number[];
  sensorProductCode: string;
  ioTDataMetricName: string;
  outputMetric: string;
  metricName: string;
  metricNameShort: string;
  metricType: string;
  metricUnits: string;
  metricUnitsDisplayPrecision: number;
  productMeasure: string;
  sensorErrorDetected: boolean;
}

function newRequestData() {
  const req: WSDataRequest = {
    id: "71408ff1-1fa6-413a-adbd-54d9a92a6a55",
    query: {
      limit: 10000,
      metrics: [
        {
          name: "com.onset.sensordata.windspeed_userdefined",
          exclude_tags: true,
          group_by: [],
          tags: {
            dataChannel: ["77131d4b-20f1-4452-9fdc-07aca288af5b"],
          },
          aggregators: [
            {
              name: "avg",
              align_start_time: true,
              sampling: {
                value: 3,
                unit: "seconds",
              },
            },
          ],
        },
        {
          name: "com.onset.sensordata.gustspeed_userdefined",
          exclude_tags: true,
          group_by: [],
          tags: {
            dataChannel: ["cfd90617-8346-4c3f-be7c-20ed3179424e"],
          },
          aggregators: [
            {
              name: "avg",
              align_start_time: true,
              sampling: {
                value: 3,
                unit: "seconds",
              },
            },
          ],
        },
        {
          name: "com.onset.sensordata.winddirection_si",
          exclude_tags: true,
          group_by: [],
          tags: {
            dataChannel: ["26c08efb-f7e4-444f-8c2e-17ef25606a17"],
          },
          aggregators: [
            {
              name: "avg",
              align_start_time: true,
              sampling: {
                value: 3,
                unit: "seconds",
              },
            },
          ],
        },
      ],
      start_relative: {
        unit: "hours",
        value: 4,
      },
    },
  };
  return req;
}

const apiMethods = {
  Query: "https://hobolink.licor.cloud/api/dashboard/public/query",
};

export function FetchWSData(): Promise<number[][]> {
  const headers: Headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const request: RequestInfo = new Request(apiMethods.Query, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(newRequestData()),
  });
  return fetch(request)
    .then((res) => res.json())
    .then((res) => {
      return res as WSResponse;
    })
    .then((wsres) => {
      console.log(wsres);
      const windspeed = wsres.queries[0].results[0].values;
      const windgust = wsres.queries[1].results[0].values;
      const winddirection = wsres.queries[2].results[0].values;
      const weatherDataMatrix = windspeed.flatMap((_, i) => [
        [
          windspeed[i][0],
          windspeed[i][1],
          windgust[i][1],
          Math.round(winddirection[i][1]),
        ],
      ]);
      return weatherDataMatrix;
    });
}
