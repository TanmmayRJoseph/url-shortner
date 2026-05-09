import { nanoid } from "nanoid";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SHORT_URL_LENGTH = 8;

export const generateShortCode = (): string => {
  return nanoid(SHORT_URL_LENGTH);
};

export const buildShortUrl = (shortCode: string): string => {
  return `${BASE_URL}/${shortCode}`;
};