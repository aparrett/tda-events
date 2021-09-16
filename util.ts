import moment from 'moment'
import { RawTimeAndSalesEvent, TimeAndSalesEvent } from './types'

export const jsonToQueryString = (json: { [x: string]: any }) => {
    return Object.keys(json)
        .map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
        })
        .join('&')
}

export const convertTimeAndSalesEvent = (event: RawTimeAndSalesEvent): TimeAndSalesEvent => {
    const { seq, key } = event
    return {
        seq,
        key,
        time: moment(event['1']).toISOString(),
        price: event['2'],
        // the quantity from time and sales always comes in divided by 100
        quantity: event['3'] * 100
    }
}

export const processTimeAndSalesEvent = (events: RawTimeAndSalesEvent[]) => {
    const e = events.map((e) => convertTimeAndSalesEvent(e))
    console.log(e)
}
