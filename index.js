var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');
var detailsdb = './details.json'
const axios = require('axios');

// app.use(cors({credentials: true, origin: 'http://localhost:4200'}));

app.use(function (req, res, next) {
   //Enabling CORS

   res.set('Access-Control-Allow-Credentials', 'true')
   res.set('Access-Control-Allow-Origin', '*')
   res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
   res.set('Access-Control-Allow-Headers', 'Content-Type')
   // let allowedOrigins = ["http://ServerA:3000", "http://localhost:4200"]
   // let origin = req.headers.origin;
   // console.log(origin)
   // if (allowedOrigins.includes(origin)) {
   //   res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
   // }

   next();
});


//  app.use(cors({credentials: false, origin: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



//chat

// let http = require('http');
// let server = http.Server(app);

const http = require('http').createServer(app);
const io = require('socket.io')(http);



let socketIO = require('socket.io');
// let io = socketIO(server, { origins: '*:*'});

 const puppeteer = require('puppeteer');
const USERNAME_SELECTOR = '#login > login > div > form > div:nth-child(1) > div > label';
const obj = { mob: '7979835401', otp: '123456', iterate: 4 }
const inputfield = '#root > div > form > div > div > input';

const loginbutton = '#login > login > div > form > div:nth-child(2) > button';
const inputfieldsforOTP = '#otp'

const loginbuttonfinal = '#login > login > div > div:nth-child(2) > form > button'


const cart = '#navbar-main > div > bigbasket-cart-template > div > div.hidden-md.hidden-lg > div > div > a > i'
const checkoutselector = ' #checkout > p'
const noslotsavailable = '#noSlotModal > div > div.slotmodal-footer > button'

const downarrow='#headerControllerId > header > div > div > div > div > ul > li:nth-child(2) > div > a > span > span.arrow-marker'
const slottext='#headerControllerId > header > div > div > div > div > ul > li:nth-child(2) > div > div > div.other-address.ng-scope > ul > li > a > div'
const slotavailabletext='#headerControllerId > header > div > div > div > div > ul > li:nth-child(2) > div > div > div.other-address.ng-scope > ul > li > a > div > div > div'




let rahulno = '+917979835401'

const accountSid = 'ACe13dbe41143f6de109884291bbfb2817';
const authToken = 'cafad106119d0afe827d6b5f06f32c93';
const client = require('twilio')(accountSid, authToken);


// app.get('/', function (req, res) {
   
//    res.send( "api started working" )
// })


// endpoint to post otp
app.post('/postotp', function (req, res) {
   obj.otp = req.body.otp;
   res.send({ status: "success" })
})

// endpoint to post mob nop. and no. of iteration to execute
app.post('/postmob', function (req, res) {
   obj.mob = req.body.mob;
   obj.iterate = parseInt(req.body.iterate);
   res.send({ status: "success" })
})
const RECIEVE_FOR_FREE=`body > div.wrap > div.benefits-section > div.content > a`


// endpoint to the p[rescribed slot if available
app.get('/getslot', async function (req, res) {
   console.log("get slot called")

   async function getPic() {
      //comment headless
     
const browser = await puppeteer.launch({ headless: false, args:['--no-sandbox'] })
      const page = await browser.newPage();
      await page.setViewport({
         width: 1100,
         height: 700,
     });
      await page.goto('https://www.bigbasket.com/auth/login/');
      await page.waitFor(10000)
      await page.click(USERNAME_SELECTOR);


console.log("entering mob no.")
      await page.waitFor(3000)
      await page.type(USERNAME_SELECTOR, obj.mob, { delay: 2 });
      await page.waitFor(5000)
      // await page.keyboard.type(obj.mob);
      await page.click(loginbutton);

      await page.waitFor(26000)
      console.log("entering otp")
      await page.type(inputfieldsforOTP, obj.otp, { delay: 3 })
      await page.waitFor(2000)
      await page.click(loginbuttonfinal);
      await page.waitFor(10000)
      console.log("login success")

  var counting=1;
      while (obj.iterate--) {
         console.log(`checking for slots for ${counting++}`)
         await page.reload({waitUntil: ["load","networkidle2"], timeout: 0})
      await page.waitFor(10000)
      await page.click(downarrow);
      await page.waitFor(7000)

      if (await page.$(slotavailabletext) !== null) {
          console.log("slot text available")
         const element = await page.$(slotavailabletext);
         const text = await page.evaluate(element => element.textContent, element);

         if(text== "All Slots Full. Please Try Again Later")
         {

         }
         else{
            client.messages
            .create({
               body: 'Hurray Rahul!!slot is available order at earliest',
               from: '+18156688642',
               to: rahulno
            })
            .then(message => console.log(message, message.sid));
            await browser.close();
            res.send({ status: 'success', time:`order at earliest as slot is available at ${new Date()}`  })
         }
         
      }
      else
      {
         await page.screenshot({ path: 'google.png' });
         client.messages
            .create({
               body: 'Hurray Rahul!!chances of  slot is available',
               from: '+18156688642',
               to: rahulno
            })
            .then(message => console.log(message, message.sid));
            await browser.close();
         res.send({ status: 'success', time:`chances of  slot is available at ${new Date()}`  })
      }

      if (obj.iterate == 0) {
         await browser.close();
         console.log("exiting application")
         client.messages
            .create({
               body: 'Sorry Rahul!! Hard luck slot not available',
               from: '+18156688642',
               to: rahulno
            })
            .then(message => console.log(message, message.sid));
         res.send({ status: 'failed', time:`Hard luck  slot not available at ${new Date()}` })
        
      }

   }


}

    



   


   

   await getPic();



});


// endpoint to the p[rescribed slot if available
app.get('/', async function (req, res) {
   console.log("api place order hitted")

   async function getPic() {
      //comment headless
     
     const browser = await puppeteer.launch({ headless: true, args:['--no-sandbox'] })
      const page = await browser.newPage();
      await page.setViewport({
         width: 1100,
         height: 700,
     });
      await page.goto('https://mahashivarathri.org/en/rudraksha-diksha');
      await page.waitFor(10000)
      await page.click(RECIEVE_FOR_FREE);
      await page.waitFor(2000)
      await page.screenshot({path: 'example.png'});
      await browser.close();

      res.send({status: 200})
// console.log("entering mob no.")
//       await page.waitFor(3000)
//       await page.type(USERNAME_SELECTOR, obj.mob, { delay: 2 });
//       await page.waitFor(5000)
//       // await page.keyboard.type(obj.mob);
//       await page.click(loginbutton);

//       await page.waitFor(26000)
//       console.log("entering otp")
//       await page.type(inputfieldsforOTP, obj.otp, { delay: 3 })
//       await page.waitFor(2000)
//       await page.click(loginbuttonfinal);
//       await page.waitFor(10000)
//       console.log("login success")

  


}

    



   


   

   await getPic();



});


io.on('connection', (socket) => {
   console.log('a user connected');
   socket.on('waychat', (message) => {
      console.log(message);
      io.emit(  'waychat', message);
    });
    
});

io.on('waychat', (message) => {
   console.log("message is",message)
   io.emit(message);
 });




http.listen(PORT, () => { console.log(`listening ${PORT}`) })
