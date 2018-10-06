require('dotenv').config()

const keys = require('./keys')
const Spotify = require('node-spotify-api')
const request = require('request')
const k = require('kyanite/dist/kyanite')
const date = require('date-fns/format')
const fs = require('fs')

const spotify = new Spotify(keys.spotify)
const spotifyQuery = x => x[3] ? k.join(' ', k.slice(3, x.length, x)) : 'The Sign Ace of Base'

if (process.argv[2] === 'spotify-this-song') {
  spotify.search({ type: 'track', query: spotifyQuery(process.argv), limit: 50 }, function (err, data) {
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

const bitAPIquery = 'https://rest.bandsintown.com/artists/' + k.join(' ', k.slice(3, process.argv.length, process.argv)) + '/events?app_id=codingbootcamp'

if (process.argv[2] === 'concert-this') {
  request(bitAPIquery, function (err, response, body) {
    if (err) console.log(err)
    else {
      const results = JSON.parse(body)[0]
      const venue = results.venue.name
      console.log('Venue: ' + venue)
      const location = results.venue.city + ', ' + results.venue.city
      console.log('Location: ' + location)
      const date2 = 'Date: ' + date(new Date(results.datetime), 'MMMM D, YYYY HH:mm')
      console.log(date2)
    }
  })
}

const omdbQuery = x => x[3] ? 'http://www.omdbapi.com/?apikey=9969d46b&t=' + k.join(' ', k.slice(3, x.length, x)) : 'http://www.omdbapi.com/?apikey=9969d46b&i=tt0485947'

if (process.argv[2] === 'movie-this') {
  request(omdbQuery(process.argv), function (err, response, body) {
    if (err) console.log(err)
    else {
      const results = JSON.parse(body)
      const title = results.Title
      console.log('Title: ' + title)
      const year = results.Year
      console.log('Released: ' + year)
      const imdbRating = results.imdbRating
      console.log('IMDB Rating: ' + imdbRating)
      const rtRating = results.Ratings[1]
      console.log(rtRating.Source + ': ' + rtRating.Value)
      const country = results.Country
      console.log('Country: ' + country)
      const language = results.Language
      console.log('Language(s): ' + language)
      const plot = results.Plot
      console.log('Plot: ' + plot)
      const actors = results.Actors
      console.log('Actors: ' + actors)
    }
  })
}

if (process.argv[2] === 'do-what-it-says') {
  let info = []
  fs.readFile('random.txt', 'utf-8', function (err, data) {
    if (err) {
      console.log(err)
    } else {
      info = k.split(',', data)

    }
  })
}
