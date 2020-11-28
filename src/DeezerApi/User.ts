import axios, { AxiosProxyConfig } from 'axios'
import { DeezerDefaultHeader, DeezerDefaultParams } from './DefaultParams'

export class User {
    Arl: string
    Sid: string
    Token: string
    Proxy: AxiosProxyConfig

    constructor(Arl: string, HttpProxy?: AxiosProxyConfig) {
        this.Arl = Arl
        this.Proxy = HttpProxy
    }

    GetCookie = () => {
        return 'arl=' + this.Arl + '; sid=' + this.Sid
    }

    InitSession = async () => {
        const options = {
            withCredentials: true,
            proxy: this.Proxy,
            headers: {
                cookie: 'arl=' + this.Arl,
            },
        }

        const { data } = await axios.get('http://www.deezer.com/ajax/gw-light.php?method=deezer.ping&api_version=1.0&api_token', options)

        this.Sid = data.results.SESSION
        return this.Sid
    }

    GetUserData = async () => {
        const res = await axios.post(
            'http://www.deezer.com/ajax/gw-light.php',
            {},
            {
                params: {
                    ...DeezerDefaultParams,
                    api_token: 'null',
                    method: 'deezer.getUserData',
                },
                proxy: this.Proxy,
                headers: {
                    ...DeezerDefaultHeader,
                    cookie: 'arl=' + this.Arl + '; sid=' + this.Sid,
                },
            }
        )

        if (res.data.results.USER.USER_ID === 0) throw new Error('Invalid ARL token')

        this.Token = res.data.results.checkForm
        return res.data.results
    }
}

export const CreateUser = async (Arl: string, HttpProxy?: AxiosProxyConfig): Promise<User> => {
    const MyUser = new User(Arl, HttpProxy)
    await MyUser.InitSession()
    await MyUser.GetUserData()
    return MyUser
}
