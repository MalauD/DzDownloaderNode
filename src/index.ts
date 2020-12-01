/* tslint:disable-next-line */
const axiosRetry = require('axios-retry')
import Axios from 'axios'
Axios.defaults.withCredentials = true
axiosRetry(Axios)

export * from './DeezerApi'
