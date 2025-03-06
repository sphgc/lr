<script lang="ts">
export interface StationData {
  timestamp: number;
  /** Wind speed, kmh */
  wind: number;
  /** Gust speed, kmh */
  gust: number;
  /** Wind direction, degrees */
  direction: number;
}
export const STATION_REQUEST_INTERVAL = 1000 * 10;
</script>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { onUnmounted, ref, watch, type Ref } from "vue";
import Latest from "./components/Latest.vue";
import WindCharts, {
  Y_AXIS_WIDTH,
} from "./components/WindCharts/WindCharts.vue";
import { getChartsData } from "./components/WindCharts/chartsData";
import { FetchWSData } from "./data/dataManager";
import { STATION } from "./station";
import { useChartsStore } from "./stores/chartsStore";
import { useDocumentVisible } from "./utils/useDocumentVisible";
import { useElementWidth } from "./utils/useElementWidth";
import { knotsToKmh } from "./utils/utils";

/**
 * HOBO's `WebSocket` data format
 */
enum HOBO_STATION_DATA {
  TIMESTAMP = 0,
  WIND,
  GUST,
  DIRECTION,
}

function errorHandler(reason: any) {
  //TODO: display errors
  console.log("TODO: error hanlding on UI");
  console.log(reason);
}

const onStationDataRecieved = (
  data: number[][],
  isDocumentVisible: boolean,
  stationData: Ref<StationData[]>,
  timeout: Ref<number | undefined>
) => {
  console.dir(data);
  // Only set new `stationData` value when there is a new data from the server
  if (
    stationData.value.length === 0 ||
    data.length > stationData.value.length ||
    (data.length > 0 &&
      data[data.length - 1][HOBO_STATION_DATA.TIMESTAMP] >
        stationData.value[stationData.value.length - 1].timestamp)
  ) {
    if (STATION.HOBO_DASHBOARD_UNIT === "kmh") {
      stationData.value = data.map((entry: number[]) => {
        return {
          timestamp: entry[HOBO_STATION_DATA.TIMESTAMP],
          wind: entry[HOBO_STATION_DATA.WIND],
          gust: entry[HOBO_STATION_DATA.GUST],
          direction: entry[HOBO_STATION_DATA.DIRECTION],
        } as StationData;
      });
    } else if (STATION.HOBO_DASHBOARD_UNIT === "kt") {
      stationData.value = data.map((entry: number[]) => {
        return {
          timestamp: entry[HOBO_STATION_DATA.TIMESTAMP],
          wind: knotsToKmh(entry[HOBO_STATION_DATA.WIND]),
          gust: knotsToKmh(entry[HOBO_STATION_DATA.GUST]),
          direction: entry[HOBO_STATION_DATA.DIRECTION],
        } as StationData;
      });
    }
  }

  if (timeout.value !== undefined) {
    clearTimeout(timeout.value);
  }
  // Request new station data only if current browser tab is active.
  // This results in saving battery for mobile devices, less data usage,
  // and less requests to the server.
  if (isDocumentVisible) {
    timeout.value = window.setTimeout(() => {
      // const now = Date.now();
      FetchWSData()
        .then((value) => {
          onStationDataRecieved(value, isDocumentVisible, stationData, timeout);
        })
        .catch((error) => {
          errorHandler(error);
        });
    }, STATION_REQUEST_INTERVAL);
  }
};

let timeout: Ref<number | undefined> = ref(undefined);

const chartsStore = useChartsStore();

const isDocumentVisible: Ref<boolean> = useDocumentVisible();
const stationData = ref<StationData[]>([]);

const prevChartTimeRange = ref<number>(chartsStore.timeRange);
const chartsWrapperRef = ref<HTMLDivElement>();
const chartsWrapperWidth = useElementWidth(chartsWrapperRef);
const chartsData = computed(() => {
  return chartsWrapperWidth.value > 0
    ? getChartsData(
        stationData.value,
        chartsStore.timeRange,
        chartsWrapperWidth.value - Y_AXIS_WIDTH
      )
    : undefined;
});

watch(
  isDocumentVisible,
  (isDocumentVisible) => {
    if (timeout.value !== undefined) {
      clearTimeout(timeout.value);
    }
    // Request station data only if current browser tab is active.
    // This results in saving battery for mobile devices, less data usage,
    // and less requests to the server.
    if (isDocumentVisible) {
      // Trigger initial fetch of data when document becomes in focus, which then starts update loop
      console.log("Document in focus - start data collection");
      FetchWSData()
        .then((value) => {
          onStationDataRecieved(value, isDocumentVisible, stationData, timeout);
        })
        .catch((error) => {
          errorHandler(error);
        });
    }
  },
  { immediate: true }
);

chartsStore.$subscribe(() => {
  // Make a new data network request only when setting langer chart interval.
  // Otherwise, we should already have all the data we need
  // from the previous network request.
  // Without BigInt those numbers are too big for JS🤣 and it doesn't work.
  console.log("Chartstore");
  if (BigInt(chartsStore.timeRange) > BigInt(prevChartTimeRange.value)) {
    if (timeout.value !== undefined) {
      clearTimeout(timeout.value);
    }
    // const now = Date.now();
    const response = FetchWSData();
    console.log(response);
  }
  prevChartTimeRange.value = chartsStore.timeRange;
});

onUnmounted(() => {
  if (timeout.value !== undefined) {
    clearTimeout(timeout.value);
  }
});
</script>

<template>
  <div v-if="stationData.length === 0">Loading...</div>
  <template v-else>
    <Latest :latestDataEntry="stationData[stationData.length - 1]" />
    <div ref="chartsWrapperRef">
      <WindCharts
        v-if="chartsData !== undefined"
        :chartsData="chartsData"
        :chartWidth="chartsWrapperWidth - Y_AXIS_WIDTH"
        :latestDataTimestamp="stationData[stationData.length - 1].timestamp"
      />
    </div>
  </template>
</template>
