const nodemailer = require('nodemailer')
const {
    google
} = require('googleapis')
const OAuth2 = google.auth.OAuth2

const myOAuth2Client = new OAuth2(process.env.GOOGLE_ID, process.env.GOOGLE_SECRET, "https://developers.google.com/oauthplayground")

myOAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
})

const myAccessToken = myOAuth2Client.getAccessToken()

module.exports = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL,
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: myAccessToken
    }
})