// Bring in npm packages
require('dotenv').config()

const keys = require('./keys')
const Spotify = require('node-spotify-api')
const request = require('request')
const k = require('kyanite/dist/kyanite')
const date = require('date-fns/format')
const fs = require('fs')
const inquirer = require('inquirer')

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
  // build the spotify query
  const spotifyQuery = x => x || 'The Sign Ace of Base'
  // make the api call
  spotify.search({ type: 'track', query: spotifyQuery(x), limit: 50 }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err)
    }
    // find objects that contain a preview url and get the keys needed
    const trackInfoObj = k.pipe([
      k.sift(x => x.preview_url),
      k.draft(k.props(['popularity', 'name', 'album', 'artists', 'preview_url']))
    ], data.tracks.items)
    // create an array of the responses, order by popularity (ascending), return the last index
    const trackInfo = k.pipe([
      k.values,
      k.sortBy(x => x[0]),
      k.last
    ], trackInfoObj)
    // assign variables
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
  // build query
  const bitAPIquery = x => 'https://rest.bandsintown.com/artists/' + x + '/events?app_id=codingbootcamp'
  // make API call
  request(bitAPIquery(x), function (err, response, body) {
    if (err) console.log(err)
    else {
      const results = JSON.parse(body)[0]
      // assign variables
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
  // build query
  const omdbQuery = x => x ? 'http://www.omdbapi.com/?apikey=9969d46b&t=' + x : 'http://www.omdbapi.com/?apikey=9969d46b&i=tt0485947'
  // make API call
  request(omdbQuery(x), function (err, response, body) {
    if (err) console.log(err)
    else {
      const results = JSON.parse(body)
      // assign variables
      const title = results.Title
      const year = results.Year
      const imdbRating = results.imdbRating
      const rtRating = results.Ratings[1]
      const country = results.Country
      const language = results.Language
      const plot = results.Plot
      const actors = results.Actors

      const output = '\nTitle: ' + title + '\nReleased: ' + year + '\nIMDB Rating: ' + imdbRating + '\n' + rtRating.Source + ': ' + rtRating.Value + '\nCountry: ' + country + '\nLanguage(s): ' + language + '\nPlot: ' + plot + '\nActors: ' + actors

      append(output)
    }
  })
}

// do-what-it-says
const doIt = () => {
  let info = []
  // read and return information from random.txt
  fs.readFile('random.txt', 'utf-8', function (err, data) {
    if (err) {
      console.log(err)
    } else {
      // parse information to pass to run()
      info = k.split(',', data)
      let infoArray = k.insert(0, '', info)
      infoArray = k.insert(0, '', infoArray)
      run(infoArray)
    }
  })
}

// main function
const run = (x, y) => {
  if (x === 'spotify-this-song') runSpotify(y)
  if (x === 'concert-this') findConcert(y)
  if (x === 'movie-this') findMovie(y)
  if (x === 'do-what-it-says') doIt()
}

inquirer
  .prompt([
    {
      type: 'list',
      name: 'command',
      message: 'Choose a command from below.',
      choices: ['spotify-this-song', 'concert-this', 'movie-this', 'do-what-it-says']
    },
    {
      type: 'input',
      name: 'title',
      message: 'What is the title?'
    }
  ]).then(answers => {
    run(answers.command, answers.title)
  })
