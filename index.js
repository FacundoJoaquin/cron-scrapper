const app = require('./src/app')
const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`Server is listening on: http://localhost:${port}`)
})
