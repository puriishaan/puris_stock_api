import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY || '8CIHYJZG8XUG3DEGD';

const makeApiRequest = async (functionName: string, params: { [key: string]: string }) => {
  const baseUrl = 'https://www.alphavantage.co/query';
  params['function'] = functionName;
  params['apikey'] = API_KEY;

  try {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${functionName}:`, error);
    throw new Error('Error fetching data');
  }
};

const chooseApiEndpoint = (intent: string): string | undefined => {
  const apiMap: { [key: string]: string } = {
    news: 'NEWS_SENTIMENT',
    intraday: 'TIME_SERIES_INTRADAY',
    daily: 'TIME_SERIES_DAILY_ADJUSTED',
    exchangeRate: 'CURRENCY_EXCHANGE_RATE',
    companyOverview: 'OVERVIEW',
  };
  return apiMap[intent.toLowerCase()];
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { intent, symbol, interval, from_currency, to_currency, tickers } = query;

  if (!intent || typeof intent !== 'string') {
    return { error: 'Missing or invalid intent parameter' };
  }

  const functionName = chooseApiEndpoint(intent);

  if (!functionName) {
    return { error: 'Invalid intent specified' };
  }

  const params: { [key: string]: string } = {};

  switch (functionName) {
    case 'TIME_SERIES_INTRADAY':
      if (!symbol || typeof symbol !== 'string' || !interval || typeof interval !== 'string') {
        return { error: 'Missing or invalid parameters for intraday data' };
      }
      params['symbol'] = symbol;
      params['interval'] = interval;
      break;
    case 'NEWS_SENTIMENT':
      if (!tickers || typeof tickers !== 'string') {
        return { error: 'Missing or invalid parameters for news sentiment' };
      }
      params['tickers'] = tickers;
      break;
    case 'CURRENCY_EXCHANGE_RATE':
      if (!from_currency || typeof from_currency !== 'string' || !to_currency || typeof to_currency !== 'string') {
        return { error: 'Missing or invalid parameters for exchange rate' };
      }
      params['from_currency'] = from_currency;
      params['to_currency'] = to_currency;
      break;
    case 'OVERVIEW':
      if (!symbol || typeof symbol !== 'string') {
        return { error: 'Missing or invalid parameters for company overview' };
      }
      params['symbol'] = symbol;
      break;
    case 'TIME_SERIES_DAILY_ADJUSTED':
      if (!symbol || typeof symbol !== 'string') {
        return { error: 'Missing or invalid parameters for daily data' };
      }
      params['symbol'] = symbol;
      break;
    default:
      return { error: 'Unknown API function' };
  }

  try {
    const data = await makeApiRequest(functionName, params);
    return data;
  } catch (error) {
    return { error: error.message };
  }
});
