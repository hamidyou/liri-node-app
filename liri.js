require('dotenv').config()

const keys = require('./keys')
const Spotify = require('node-spotify-api')
const request = require('request')
const k = require('kyanite/dist/kyanite')

const spotify = new Spotify(keys.spotify)

// const concert = 'concert-this'
// const spot = 'spotify-this-song'
// const movie = 'movie-this'
// const doWhatItSays = 'do-what-it-says'

// const bitAPIquery = 'https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp'

if (process.argv[2] === 'spotify-this-song') {
  spotify.search({ type: 'track', query: k.join('', k.slice(3, process.argv)), limit: 50 }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err)
    }

    const trackInfoObj = k.pipe([
      k.sift(x => x.preview_url),
      k.draft(k.props(['popularity', 'name', 'album', 'artists', 'preview_url']))
    ], data.tracks.items)

    const trackInfo = k.pipe([
      k.values,
      k.sortBy(x => x[0]),
      k.last
    ], trackInfoObj)

    const artist = trackInfo[3][0].name
    const song = trackInfo[2].name
    const preview = trackInfo[4]
    const album = trackInfo[1]

    console.log('Artist: ' + artist + '\n' + 'Song Title: ' + song + '\n' + 'Preview Link: ' + preview + '\n' + 'Album: ' + album)
  })
}
