import { STATION } from '@/station';

const streams = {
    WindSpeed: '21900847-21933816-1-1-Wind_Speed',
    GustSpeed: '21900847-21933816-2-1-Wind_Gust',
    WindDirection: '21900847-21933816-3-1-Wind_Direction',
};

const ApiMethods = {
    GetUserData: 'app/api/dashboard/GetUserData',
};

function getTSParams(streams: any, from_date: any, to_date: any) {
    const body = {
        dataType: 'raw',
        streams: streams,
        dataFormat: 'dygraphs',
        aggregationRange: 10,
        display_metric: 'si',
        fetchPeriod: 'past_day',
        fetchTimeZone: STATION.TIMEZONE,
        dockey: STATION.HOBO_DASHBOARD_DOCKEY,
        from_date,
        to_date,
    };
    return body;
}

function getLatestParams(stream: any) {
    const body = {
        dataType: 'latest',
        streams: stream,
        dataFormat: 'live',
        aggregationRange: 10,
        display_metric: 'si',
        fetchPeriod: 'past_day',
        fetchTimeZone: STATION.TIMEZONE,
        dockey: STATION.HOBO_DASHBOARD_DOCKEY,
    };
    return body;
}

function requestTSData(
    ws: WebSocket,
    id: string,
    streams: any[],
    from_date: number,
    to_date: number
) {
    const payload = {
        method: ApiMethods.GetUserData,
        params: {
            body: JSON.stringify(getTSParams(streams, from_date, to_date)),
        },
        id: id,
    };

    if (ws.readyState == ws.OPEN) {
        console.log('Using WSS conn' + ws);
        console.log('payload=' + JSON.stringify(payload));
        ws.send(JSON.stringify(payload));
    }
}

function requestLatestData(ws: WebSocket, id: string, streams: any[]) {
    const payload = {
        method: ApiMethods.GetUserData,
        params: {
            body: JSON.stringify(getLatestParams(streams)),
        },
        id: id,
    };

    if (ws.readyState == ws.OPEN) {
        console.log('Using WSS conn' + ws);
        console.log('payload=' + JSON.stringify(payload));
        ws.send(JSON.stringify(payload));
    }
}

export default class DataManager {
    constructor(
        private readonly ws: WebSocket,
        tsdataUpdater: (arg0: any) => void,
        livedataUpdater: (arg0: any) => void,
        errorHandler: (arg0: any) => void
    ) {
        this.ws = ws;
        this.ws.onmessage = function (event: { data: string }) {
            console.log(event);
            const data = JSON.parse(event.data);
            console.log('Status=' + data.status);
            if (
                data.status == 'success' &&
                Object.hasOwn(data.result, 'data')
            ) {
                // time-series response has data property
                tsdataUpdater(data.result.data);
            } else if (
                data.status == 'success' &&
                Object.hasOwn(data.result[0], 'value')
            ) {
                // a single 'latest' response has value property
                livedataUpdater(data.result);
            } else if (data.result == 'connected.') {
                // Do nothing for connection event for now - but could add handler for presentation layer if needed
            } else {
                //TODO: might need more connection management on errors
                errorHandler(event);
            }
        };
    }

    /**
     * Sends a request to the websocket to get latest value for
     * one of the metric streams.
     * @function RequestTSData
     * @param {string} id Id is used as reference for the WSS request/response
     * @param {array} streams Array of data stream ids you want the timeseries data from. Use stream.<metric> constants to identify the streams.
     * @param {long} from_date The EPOC time for the start of the data range.
     * @param {long} to_date The EPOC time for the start of the data range.
     */
    RequestTSData(
        id: string,
        streams: any[],
        from_date: number,
        to_date: number
    ) {
        return requestTSData(this.ws, id, streams, from_date, to_date);
    }

    /**
     * Sends a request to the websocket to get latest value for
     * one of the metric streams.
     * @function RequestLatestData
     * @param id Id is used as reference for the WSS request/response
     * @param stream Data stream you want the latest value from. Use stream.<metric> constants to identify the stream.
     */
    RequestLatestData(id: string, stream: any) {
        return requestLatestData(this.ws, id, stream);
    }

    get Streams() {
        return streams;
    }
}
