export interface RawTimeAndSalesEvent {
    '1': number
    '2': number
    '3': number
    '4': number
    seq: number
    key: string
}

export interface TimeAndSalesEvent {
    seq: number
    key: string
    time: string
    price: number
    quantity: number
}