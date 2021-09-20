import Axios from 'axios'
import { IAxiosRetryConfig } from 'axios-retry'
import { User } from './User'
import { GetAes, GetMd5, GetMd5Bf } from '../Tools/Crypto'
import { DeezerDefaultHeader, DeezerDefaultParams } from './DefaultParams'

const unofficialApiUrl = 'http://www.deezer.com/ajax/gw-light.php'

interface TrackApiResult {
    SNG_ID: number
    SNG_TITLE: string
    ALB_TITLE: string
    ART_NAME: string
    TRACK_NUMBER: string
    MD5_ORIGIN: string
    FILESIZE_MP3_320: number
    FILESIZE_MP3_128: number
    MEDIA_VERSION: number
}

enum TrackQualities {
    MP3_128 = 1,
    MP3_320 = 3,
}

export class Track {
    Id: number
    Md5: string
    MediaVersion: number
    Format: TrackQualities
    Size: number
    Title: string
    Album: string
    Artist: string
    TrackNumber: number

    constructor(ApiResult: TrackApiResult) {
        this.Id = ApiResult.SNG_ID
        this.Md5 = ApiResult.MD5_ORIGIN
        this.MediaVersion = ApiResult.MEDIA_VERSION
        this.Format = true ? TrackQualities.MP3_128 : TrackQualities.MP3_320 // 128kbit/s not available anymore
        this.Size = true ? ApiResult.FILESIZE_MP3_128 : ApiResult.FILESIZE_MP3_320
        this.TrackNumber = parseInt(ApiResult.TRACK_NUMBER, 10)
        ;(this.Title = ApiResult.SNG_TITLE), (this.Album = ApiResult.ALB_TITLE), (this.Artist = ApiResult.ART_NAME)
    }

    GetTrackFileName() {
        const Data = [this.Md5, String(this.Format), this.Id, this.MediaVersion].join('¤')
        let JoinedData = GetMd5(Data, 'hex') + '¤' + Data + '¤'
        while (JoinedData.length % 16 > 0) JoinedData += ' '
        return GetAes(JoinedData, 'jo6aey6haid2Teih')
    }

    GetDownloadUrl() {
        return 'http://e-cdn-proxy-' + this.Md5[0] + '.deezer.com/mobile/1/' + this.GetTrackFileName()
    }

    GetBlowfishKey() {
        const Secret = 'g4el58wc' + '0zvf9na1'
        const Md5MusicId = GetMd5Bf(this.Id.toString())
        let BlowfishKey = ''
        for (let i = 0; i < 16; i++) {
            BlowfishKey += String.fromCharCode(Md5MusicId.charCodeAt(i) ^ Md5MusicId.charCodeAt(i + 16) ^ Secret.charCodeAt(i))
        }
        return BlowfishKey
    }
}

export const GetTrackById = async (Id: number, LoggedUser: User, RequestOptions?: IAxiosRetryConfig): Promise<Track> => {
    const res = await Axios.post(
        unofficialApiUrl,
        {
            sng_id: Id,
        },
        {
            params: {
                api_token: LoggedUser.Token,
                ...DeezerDefaultParams,
                method: 'song.getData',
            },
            headers: {
                DeezerDefaultHeader,
                cookie: LoggedUser.GetCookie(),
            },
            'axios-retry': RequestOptions,
        }
    )
    return new Track(res.data.results)
}
