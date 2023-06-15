const express = require('express')
require('dotenv').config()
const fetch =  require('node-fetch')
var cors = require('cors')
var formurlencoded = require('form-urlencoded')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const querystring = require('querystring');

const app = express()

app.use(cors({
  origin: '*',
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 3000

// To hold the payment result data posted by Payments Hub
let paymentResultData

app.post('/getTAC', async (req, res) => {
  const { amount } = req.body

  const MAC = process.env.MAC
  const TRAN_NBR = Math.floor(Math.random() * 1000000000)
  const TRAN_GROUP = process.env.TRAN_GROUP
  const REDIRECT_URL = process.env.REDIRECT_URL

  const formData = {
    amount,
    MAC,
    TRAN_NBR,
    TRAN_GROUP,
    REDIRECT_URL
  }

  try {
    const response = await fetch('https://keyexch.epxuap.com', {
   	 method: 'post',
   	 body: formurlencoded(formData),
   	 headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });

    const data = await response.text()

    const dom = new JSDOM(data)
    const TAC = dom.window.document.querySelector("FIELD").textContent

    res.status(200).json({
   	 data: TAC
    })

  } catch (error) {
    console.log(error)
    res.status(400).json({
   	 error: 'An error occurred.'
    })
  }
})

app.post('/paymentResult', async (req, res) => {
  try {
    const result = req.body;

    const data = querystring.stringify(result);

    paymentResultData = data

    res.redirect(process.env.PAYMENT_RESULT_PAGE_LINK)

  } catch (error) {
    console.log('error:', error);

    res.status(400).json({
      data: 'Payment failed.'
    });
  }
});

app.get('/getPaymentResult', (req, res) => {
  res.status(200).json({
    data: paymentResultData
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
