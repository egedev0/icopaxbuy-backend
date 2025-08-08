import axios from "axios";


export const getBinancePrice = async (symbol: string) => {
    if (symbol.startsWith('W')) symbol = symbol.slice(1);
    const url = `https://www.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;
    const { data: {price}} = await axios.get(url);
    return String(price);
}