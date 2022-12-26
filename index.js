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
   let allowedOrigins = ["https://bbtracker.onrender.com", "http://localhost:4200"]
   let origin = req.headers.origin;
   console.log(origin)
   if (allowedOrigins.includes(origin)) {
     res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
   }

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

const downarrow = '#headerControllerId > header > div > div > div > div > ul > li:nth-child(2) > div > a > span > span.arrow-marker'
const slottext = '#headerControllerId > header > div > div > div > div > ul > li:nth-child(2) > div > div > div.other-address.ng-scope > ul > li > a > div'
const slotavailabletext = '#headerControllerId > header > div > div > div > div > ul > li:nth-child(2) > div > div > div.other-address.ng-scope > ul > li > a > div > div > div'




let rahulno = '+917979835401'

const accountSid = 'ACe13dbe41143f6de109884291bbfb2817';
const authToken = 'cafad106119d0afe827d6b5f06f32c93';
const client = require('twilio')(accountSid, authToken);

const details = {
   firstName: 'Rohit Kumar',
   email: 'rkrah523@gmail.com',
   pin: '800006',
   house: 'at Nalanda House ,golakpur rani ghat',
   area: 'MOB 7903328849',
   landmark: 'near NIT gate No. 2 ',
   mob: '7979835402',
   otp: '123456'


}




// app.get('/', function (req, res) {

//    res.send( "api started working" )
// })


const RECIEVE_FOR_FREE = `body > div.wrap > div.benefits-section > div.content > a`
const FIRST_NAME = '#first_name'

const EMAIL = '#email';
const PINCODE = '#pincode';
const HOUSE = '#addessline1';
const AREA = '#addessline2';
const LANDMARK = '#landmark';
const CONTACT = '#contact_no';
const OUTSIDE_CLICK = '#reg_details_form > div.form > div.block.otp-box';
const ERROR_SELECTOR = '#number_error_msg';
const AGREE_1 = '#reg_details_form > div.form > div.terms-message > div.terms-message-checkbox > label:nth-child(1) > div.checkbox';
const AGREE_2 = '#reg_details_form > div.form > div.terms-message > div.terms-message-checkbox > label:nth-child(3) > div.checkbox'
const CONFIRM_OTP = '#reg_details_form > div.form > div.access-point > button'
const VERIFY_OTP = 'body > div.wrap > div.registration-section > div.data-content > div > div.verification-info > div.otp-verification > div.form > div.access-point > div.button.contribute.primary.vertify-btn';
const CODEBOX_1 = '#codeBox1'
const SKIP_SELECTOR = '#donate_form > div > div.access-point > div'

const INVALID_OTP = "#otp-error-msg"
// const EMAIL= '#email';

// endpoint to post otp
app.post('/postotp', function (req, res) {
   details.otp = req.body.otp;
   res.send({ status: "success" })
})

// endpoint to post mob nop. and no. of iteration to execute
app.post('/postmob', function (req, res) {
   details.mob = req.body.mob;
   // obj.iterate = parseInt(req.body.iterate);
   res.send({ status: "success" })
})


app.get('/startOrder1', async function (req, res) {
   io.emit('waychat', 'started');

})


// endpoint to the p[rescribed slot if available
app.get('/startOrder', async function (req, res) {
   console.log("api place order hitted")

   async function getPic() {
      //comment headless

      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage();
      await page.setViewport({
         width: 1100,
         height: 700,
      });
      await page.goto('https://mahashivarathri.org/en/rudraksha-diksha');
      await page.waitFor(10000)
      await page.click(RECIEVE_FOR_FREE);
      await page.waitFor(2000)
      //  await page.screenshot({ path: 'example.png' });
      // res.write("foo");

      io.emit('waychat', `Page Opens ,with ${details.mob}`);

      await page.type(FIRST_NAME, details.firstName, { delay: 100 });
      await page.type(EMAIL, details.email, { delay: 10 });
      await page.type(PINCODE, details.pin, { delay: 1000 });
      // res.write("bar");
      await page.type(HOUSE, details.house, { delay: 100 });
      await page.type(AREA, details.area, { delay: 100 });
      await page.type(LANDMARK, details.landmark, { delay: 100 });
      await page.type(CONTACT, details.mob, { delay: 1000 });



      await page.click(OUTSIDE_CLICK);
      await page.waitFor(500)

      if (await page.$(ERROR_SELECTOR) !== null) {

         const element = await page.$(ERROR_SELECTOR);
         const text = await page.evaluate(element => element.textContent, element);
         if (text == "!First-time registrants only") {
            console.log("found")
            io.emit('waychat', `DUPLICATE USER`);
            res.send({ status: false, message: "duplicate user" })
         }
         else {
            await page.click(AGREE_1);
            await page.waitFor(100)
            await page.click(AGREE_2);
            await page.waitFor(100)
            await page.click(CONFIRM_OTP);
            io.emit('waychat', `WAITING FOR OTP`);
            await page.waitFor(30000)

            io.emit('waychat', `Entering Otp: ${details.otp}`);
            await page.type(CODEBOX_1, details.otp, { delay: 1000 });
            await page.click(VERIFY_OTP);
            await page.waitFor(10000)
          
            if (await page.$(INVALID_OTP) !== null) {

               const element = await page.$(INVALID_OTP);
               const text = await page.evaluate(element => element.textContent, element);
               console.log("invalid",text)

               if (text == "Invalid OTP.") {
                  io.emit('waychat', `WRONG OTP`);
                  await browser.close();
                  res.send({ status: false, message: "Wrong OTP" })
               }
               else {
                  io.emit('waychat', `OTP Verified`);
                  await page.waitFor(5000)

                 
                  await page.click(SKIP_SELECTOR);

                  await page.waitFor(3000)
                  // await page.screenshot({ path: 'example.png' });
                  //await page.waitFor(4000)
                  await browser.close();
                  io.emit('waychat', `SUCCESSFULY PLACED`);
                  res.send({ status: true, message: "successfully placed" })
               }

            }
            else{
               {
                  io.emit('waychat', `OTP Verified`);
                  await page.waitFor(5000)
                  await page.click(SKIP_SELECTOR);

                  await page.waitFor(3000)
                  // await page.screenshot({ path: 'example.png' });
                  //await page.waitFor(4000)
                  await browser.close();
                  io.emit('waychat', `SUCCESSFULY PLACED`);
                  res.send({ status: true, message: "successfully placed" })
               }
            }

         }
      }



   }






   await getPic().catch((error) => {
     // await browser.close();
      res.send({ status: false, message: "Some Error Occured" })

   });;



});


io.on('connection', (socket) => {
   console.log('a user connected');
   socket.on('waychat', (message) => {
      console.log(message);
      io.emit('waychat', message);
   });

});

io.on('waychat', (message) => {
   console.log("message is", message)
   io.emit(message);
});




http.listen(PORT, () => { console.log(`listening ${PORT}`) })
