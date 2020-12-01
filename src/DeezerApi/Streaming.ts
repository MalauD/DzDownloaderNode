import axios from 'axios'
import crypto = require('crypto')
import BlockStream = require('block-stream')
import { Stream, Transform } from 'stream'
import { inherits } from 'util'
import { DecryptBlowfish } from '../Tools/Crypto'
import { DeezerDefaultHeader } from './DefaultParams'
import { Track } from './Track'
import { User } from './User'

interface StreamOptions {
    Start: number
    End: number
}

function DecryptDeezerStream(BlowfishKey: string, options?): void {
    // allow use without new
    if (!(this instanceof DecryptDeezerStream)) {
        return new DecryptDeezerStream(BlowfishKey, options)
    }
    this.BlowfishKey = BlowfishKey
    this.Iter = 0
    // init Transform
    Transform.call(this, options)
}
inherits(DecryptDeezerStream, Transform)

DecryptDeezerStream.prototype._transform = function (chunk, enc, cb) {
    if (this.Iter % 3 > 0) this.push(chunk)
    else this.push(DecryptBlowfish(this.BlowfishKey, chunk), 'binary')

    this.Iter = this.Iter + 1
    cb()
}

export const GetDecryptedStream = async (TrackToDownload: Track, LoggedUser: User, OutStream: Stream, OnEnd?: () => void) => {
    const stream = await axios.get(TrackToDownload.GetDownloadUrl(), {
        responseType: 'stream',
        proxy: LoggedUser.Proxy,
        headers: {
            ...DeezerDefaultHeader,
            cookie: LoggedUser.GetCookie(),
        },
    })
    const block = new BlockStream(2048)
    if (OnEnd) stream.data.on('end', OnEnd)
    stream.data.pipe(block).pipe(new DecryptDeezerStream(TrackToDownload.GetBlowfishKey())).pipe(OutStream)

    return { TotalLength: stream.headers['content-length'] }
}
