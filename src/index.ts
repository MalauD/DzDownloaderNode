import axiosRetry from 'axios-retry';
import Axios from 'axios'
Axios.defaults.withCredentials = true
axiosRetry(Axios);

export * from './DeezerApi'
