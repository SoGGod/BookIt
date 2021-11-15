module.exports = {
  env: {
    DB_LOCAL_URI:'mongodb+srv://BookIt:BookIt@cluster0.elhov.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',

    CLOUDINARY_CLOUD_NAME:'djnhqyonm',
    CLOUDINARY_API_KEY:'226688936128695',
    CLOUDINARY_API_SECRET :'ElalnQYWV-Tnl7E0SLvldhPlA0w',

    SMTP_HOST: 'smtp.mailtrap.io',
    SMTP_PORT: '2525',
    SMTP_USER: '0aa08229ed83c2',
    SMTP_PASSWORD: '3d0473372d47c5',
    SMTP_FROM_NAME: 'BookIT',
    SMTP_FROM_EMAIL: 'noreply@bookit.com'
  },
  images:{
    domains: ['res.cloudinary.com']
  }
}
