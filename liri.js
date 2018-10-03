require('dotenv').config()

const keys = require('./keys')

const spotify = new Spotify(keys.spotify)

const concert = 'concert-this'
const spot = 'spotify-this-song'
const movie = 'movie-this'
const doWhatItSays = 'do-what-it-says'

const bitAPIquery = 'https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp'
