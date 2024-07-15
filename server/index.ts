import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  return { message: 'Welcome to the API. Please specify a valid endpoint.' };
});
