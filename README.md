# lr

This project is some quick hacking to develop a replacemnt frontend for our Paragliging/Hangliding site weather station.

## src/data/dataManager.ts

This TS library provides some methods to query the same WebSocket service used by the official HoboLink public dashboard.
The main interfaces are via the `DataManager` class to manage a connection and handle callback functions.
To request new data use the `RequestTSData` or `RequestLatestData` methods (see doc-comments of the methods).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Perform TypeScript type check

```sh
npm run type-check
```

### Compile and Minify for Production

```sh
npm run build
```

### Licore cloud api

Example curl
```
curl 'https://www.licor.cloud/api/v2/timeseriesdata' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  --data-raw '{
  "limit": 10000,
  "metrics": [
    {
      "name": "com.onset.sensordata.windspeed_userdefined",
      "exclude_tags": true,
      "group_by": [],
      "tags": { "dataChannel": ["77131d4b-20f1-4452-9fdc-07aca288af5b"] },
      "aggregators": [
        {
          "name": "avg",
          "align_start_time": true,
          "sampling": { "value": 3, "unit": "seconds" }
        }
      ]
    },
    {
      "name": "com.onset.sensordata.gustspeed_userdefined",
      "exclude_tags": true,
      "group_by": [],
      "tags": { "dataChannel": ["cfd90617-8346-4c3f-be7c-20ed3179424e"] },
      "aggregators": [
        {
          "name": "avg",
          "align_start_time": true,
          "sampling": { "value": 3, "unit": "seconds" }
        }
      ]
    },
    {
      "name": "com.onset.sensordata.winddirection_si",
      "exclude_tags": true,
      "group_by": [],
      "tags": { "dataChannel": ["26c08efb-f7e4-444f-8c2e-17ef25606a17"] },
      "aggregators": [
        {
          "name": "avg",
          "align_start_time": true,
          "sampling": { "value": 3, "unit": "seconds" }
        }
      ]
    }
  ],
  "start_relative": { "unit": "hours", "value": 2 }
}
'
  ```