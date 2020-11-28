import axios from 'axios'
import { DeezerDefaultHeader, DeezerDefaultParams } from './DefaultParams'

export class User {
    Arl: string
    Sid: string
    Token: string

    constructor(Arl: string) {
        this.Arl = Arl
    }

    GetCookie = () => {
        return 'arl=' + this.Arl + '; sid=' + this.Sid
    }

    InitSession = async () => {
        const options = {
            withCredentials: true,
            headers: {
                cookie: 'arl=' + this.Arl,
            },
        }

        const { data } = await axios.get('https://www.deezer.com/ajax/gw-light.php?method=deezer.ping&api_version=1.0&api_token', options)

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

export const CreateUser = async (Arl: string): Promise<User> => {
    const MyUser = new User(Arl)
    await MyUser.InitSession()
    await MyUser.GetUserData()
    return MyUser
}
