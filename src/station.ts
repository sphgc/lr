import { UNIT } from './stores/unitStore';

interface IStation {
    NAME: string;
    FLYABLE_WIND_DIRECTIONS: {
        MIN: number;
        MAX: number;
    };
    BORDERLINE_WIND_DIRECTIONS: {
        MIN: number;
        MAX: number;
    };
    FLYABLE_WIND_SPEEDS: {
        MIN: number;
        MAX: number;
    };
    TIMEZONE: string;
    HOBO_DASHBOARD_UNIT: UNIT;
}

export const STATION: IStation = {
    NAME: 'Long Reef',
    /** Flyable wind directions, from `MIN` to `MAX`, degrees */
    FLYABLE_WIND_DIRECTIONS: {
        MIN: 30,
        MAX: 80,
    },
    /** Borderline flyable wind directions, from `MIN` to `MAX`, degrees */
    BORDERLINE_WIND_DIRECTIONS: {
        MIN: 20,
        MAX: 90,
    },
    /** Flyable wind speeds, from `MIN` to `MAX`, kmh */
    FLYABLE_WIND_SPEEDS: {
        MIN: 17,
        MAX: 35,
    },
    /** Station time zone name in IANA format https://data.iana.org/time-zones */
    TIMEZONE: 'Australia/Sydney',
 
    /** HOBO station dashboard's wind speed unit */
    HOBO_DASHBOARD_UNIT: 'kt',

};
