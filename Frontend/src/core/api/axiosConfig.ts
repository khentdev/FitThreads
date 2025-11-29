import axios, { type AxiosInstance } from 'axios'
import { LoadEnv } from '../config/load.env'

const API_URL_KEY = import.meta.env.PROD ? "VITE_PROD_API_URL" : "VITE_DEV_API_URL"
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: LoadEnv(API_URL_KEY),
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

