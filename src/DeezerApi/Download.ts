import axios from 'axios'
import crypto = require('crypto')
import * as fs from 'fs'
import { DecryptBlowfish } from '../Tools/Crypto'
import { DeezerDefaultHeader } from './DefaultParams'
import { Track } from './Track'
import { User } from './User'

const DecryptBuffer = (SourceBuffer: Buffer, TrackToDecrypt: Track) => {
    let ChunkSize = 2048
    const PartSize = 0x1800
    const BlowfishKey = TrackToDecrypt.GetBlowfishKey()
    let i = 0
    let Pos = 0

    const DestinationBuffer = Buffer.alloc(SourceBuffer.length)
    DestinationBuffer.fill(0)

    while (Pos < SourceBuffer.length) {
        let CurrentChunk
        if (SourceBuffer.length - Pos >= 2048) ChunkSize = 2048
        else ChunkSize = SourceBuffer.length - Pos
        CurrentChunk = Buffer.alloc(ChunkSize)

        let CurrentChunkString
        CurrentChunk.fill(0)
        SourceBuffer.copy(CurrentChunk, 0, Pos, Pos + ChunkSize)
        if (i % 3 > 0 || ChunkSize < 2048) CurrentChunkString = CurrentChunk.toString('binary')
        else CurrentChunkString = DecryptBlowfish(BlowfishKey, CurrentChunk)

        DestinationBuffer.write(CurrentChunkString, Pos, CurrentChunkString.length, 'binary')
        Pos += ChunkSize
        i++
    }
    return DestinationBuffer
}

export const GetDownloadStream = async (TrackToDownload: Track, LoggedUser: User) => {
    const stream = await axios.get(TrackToDownload.GetDownloadUrl(), {
        responseType: 'arraybuffer',
        headers: {
            ...DeezerDefaultHeader,
            cookie: LoggedUser.GetCookie(),
        },
    })
    return DecryptBuffer(stream.data, TrackToDownload)
}
