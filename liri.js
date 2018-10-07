// Bring in npm packages
require('dotenv').config()

const keys = require('./keys')
const Spotify = require('node-spotify-api')
const request = require('request')
const k = require('kyanite/dist/kyanite')
const date = require('date-fns/format')
const fs = require('fs')

// Bring in spotify api verification codes
const spotify = new Spotify(keys.spotify)

// function to append to log.txt
const append = x => {
  fs.appendFile('log.txt', x, 'utf-8', function (err, data) {
    if (err) {
      console.log(err)
    } else {
      console.log('Appended successfully to log.txt')
      console.log(x)
    }
  })
}

// spotify-this-song
const runSpotify = x => {
  const spotifyQuery = x => x[3] ? k.join(' ', k.slice(3, x.length, x)) : 'The Sign Ace of Base'
  spotify.search({ type: 'track', query: spotifyQuery(x), limit: 50 }, function (err, data) {
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

    const output = '\nArtist: ' + artist + '\n' + 'Song Title: ' + song + '\n' + 'Preview Link: ' + preview + '\n' + 'Album: ' + album

    append(output)
  })
}

// concert-this
const findConcert = x => {
  const bitAPIquery = x => 'https://rest.bandsintown.com/artists/' + k.join(' ', k.slice(3, x.length, x)) + '/events?app_id=codingbootcamp'
  request(bitAPIquery(x), function (err, response, body) {
    if (err) console.log(err)
    else {
      const results = JSON.parse(body)[0]
      const venue = results.venue.name
      const location = results.venue.city + ', ' + results.venue.city
      const date2 = 'Date: ' + date(new Date(results.datetime), 'MMMM D, YYYY HH:mm')

      const output = '\nVenue: ' + venue + '\nLocation: ' + location + '\nDate: ' + date2

      append(output)
    }
  })
}

// find-movie
const findMovie = x => {
  const omdbQuery = x => x[3] ? 'http://www.omdbapi.com/?apikey=9969d46b&t=' + k.join(' ', k.slice(3, x.length, x)) : 'http://www.omdbapi.com/?apikey=9969d46b&i=tt0485947'
  request(omdbQuery(x), function (err, response, body) {
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

      const output = '\nTitle: ' + title + '\nReleased: ' + year + '\nIMDB Rating: ' + imdbRating + '\n' + rtRating.Source + ': ' + rtRating.Value + '\nCountry: ' + country + '\nLanguage(s): ' + language + '\nPlot: ' + plot + '\nActors: ' + actors

      append(output)
    }
  })
}

// do-what-it-says
const doIt = () => {
  let info = []
  fs.readFile('random.txt', 'utf-8', function (err, data) {
    if (err) {
      console.log(err)
    } else {
      info = k.split(',', data)
      let infoArray = k.insert(0, '', info)
      infoArray = k.insert(0, '', infoArray)
      run(infoArray)
    }
  })
}

const run = x => {
  if (x[2] === 'spotify-this-song') runSpotify(x)
  if (x[2] === 'concert-this') findConcert(x)
  if (x[2] === 'movie-this') findMovie(x)
  if (x[2] === 'do-what-it-says') doIt(x)
}

run(process.argv)
