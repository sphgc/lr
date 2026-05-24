
const LOGGER_ID = "21900847";
const API_TOKEN = "68zTnfbIBzqbWLqBSQuprcRj7h3bcoVVw5D39dtiHY9dton6";
const API_BASE = "https://api.licor.cloud/v1/data";

interface ApiRecord {
  logger_sn: string;
  sensor_sn: string;
  timestamp: string;
  data_type: string;
  data_type_id: string;
  value: number;
  unit: string;
  sensor_measurement_type: string;
}

interface ApiResponse {
  max_results: boolean;
  message: string;
  data: ApiRecord[];
}

function formatDateUTC(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

export async function FetchWSData(lastNhours: number = 3): Promise<number[][]> {
  const now = new Date();
  const start = new Date(now.getTime() - lastNhours * 3600 * 1000);
  const params = new URLSearchParams({
    loggers: LOGGER_ID,
    start_date_time: formatDateUTC(start),
    end_date_time: formatDateUTC(now),
  });
  const res = await fetch(`${API_BASE}?${params}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    cache: "no-cache",
  });
  const json: ApiResponse = await res.json();

  type WindEntry = { speed?: number; gust?: number; direction?: number };
  const grouped = new Map<string, WindEntry>();

  for (const record of json.data) {
    const type = record.sensor_measurement_type;
    if (type !== "Wind Speed" && type !== "Wind Gust" && type !== "Wind Direction") continue;

    if (!grouped.has(record.timestamp)) grouped.set(record.timestamp, {});
    const entry = grouped.get(record.timestamp)!;
    if (type === "Wind Speed") entry.speed = record.value;
    else if (type === "Wind Gust") entry.gust = record.value;
    else if (type === "Wind Direction") entry.direction = record.value;
  }

  return [...grouped.entries()]
    .filter(([, e]) => e.speed !== undefined && e.gust !== undefined && e.direction !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ts, e]) => [
      new Date(ts.replace(" ", "T")).getTime(),
      e.speed!,
      e.gust!,
      Math.round(e.direction!),
    ]);
}
