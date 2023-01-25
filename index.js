var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');
var detailsdb = './details.json'
const axios = require('axios');
const path = require('path');
const Pool = require('pg').Pool;
const pool = new Pool({
   user: 'rkrah523',
   host: 'shopdb-instance.cpbnl5mbaeef.ap-northeast-1.rds.amazonaws.com',
   database: 'shopdb',
   password: 'Silicon123#',
   port: 5432,
});

const { findOTP } = require('./util.js')
const { createFile,
    validateUserDetails ,
     getTrackingDetails,
      getCreatedFile ,
       getUserDetails,
       sendFiles,
       getReceiveFile,
       sendReceivedFiles,
       getDashboardDetails,
       receiveFile} = require('./dasta-util.js')

// app.use(cors({credentials: true, origin: 'http://localhost:4200'}));

app.use(function (req, res, next) {
   //Enabling CORS

   res.set('Access-Control-Allow-Credentials', 'true')
   res.set('Access-Control-Allow-Origin', '*')
   res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
   res.set('Access-Control-Allow-Headers', 'Content-Type')
 
   let allowedOrigins = ["https://sasta-bazaar.onrender.com","https://bbtracker.onrender.com", "http://localhost:4200"]
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


const details1 = {
   firstName: 'Rohit Kumar',
   email: 'rkrah523@gmail.com',
   pin: '800006',
   house: 'at Nalanda House ,golakpur rani ghat',
   area: 'MOB 7903328849',
   landmark: 'near NIT gate No. 2 ',
   mob: '7979835402',
   otp: '123456'
}

const details = {
   firstName: 'Rahul Kumar',
   email: 'rkrahul523@gmail.com',
   pin: '829109',
   house: 'at giddi c q no 1b 38',
   area: 'Jh MOB 7979835401',
   landmark: 'near durga mundap ',
   mob: '7979835402',
   otp: '123456'
}

const getAll = async (req, res) => {
   const client = await pool.connect();
   try {
      let results = await client.query(
         `SELECT * FROM public.All_Mobile_Records`);
      res.status(201).json(results.rows);
   } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release();
   }
}


const validateUser = async (req, res) => {
   const client = await pool.connect();
   // INSERT INTO public.logincred(
   //    user_name, name, password, role, department, profile_image)
   try {
      let results = await client.query(
         `SELECT * FROM public.logincred`);
      res.status(201).json(results.rows);
   } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release();
   }
}

const createRecords = async (req, res) => {
   const name = details.firstName;
   const Mobile = req.body.mob;
   const Address = details;
   const client = await pool.connect();
   try {
      let results = await client.query(
         `INSERT INTO public.All_Mobile_Records(Mobile, Address,  name) VALUES ($1, $2, $3)`
         , [Mobile, Address, name]);
      res.status(201).json({ status: true, message: `User Added with Mob${Mobile}` });
   } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release();
   }
}



//alreadyRegisted 
//wrongOtp
//isDuplicate
const updateRecords = async (data, res) => {
   //const data= {key: 'wrongOtp', value: true, mob: '7979835402'}

   const client = await pool.connect();
   try {
      let results = await client.query(
         `UPDATE public.All_Mobile_Records
      SET ${data.key}=${data.value} , lastUpdated='${new Date()}'
      WHERE Mobile=${data.mob}`);
      return results;
      //res.status(200).json({ status: true, message: `User modified with Mob${Mobile}`});
   } catch(e){
      console.log("error while updating ", e)
      throw e;
   }
   finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release();
   }
   
}

app.get(`/getallRecords`, async (req, res) => {
   // const { 
   //   uid, displayName, email, 
   //   emailVerified, photoURL 
   // } = JSON.parse(req.body.user);

   const getall = await getAll(req, res).catch(err => {
      res.status(500).json({
         status: false,
         "code": err.code,
         "message": err.message
      });
   });




});
const otpSelecter = `body > linkrel="canonical" > section > div > div.row > div.col-sm-10 > table:nth-child(4) > tbody > tr > td:nth-child(3)`



app.get('/someError', async (req, res) => {
const mob= req.query.mob;
   const registered = { key: 'someError', value: true,mob }
   await updateRecords(registered, res);
   res.send({ status: "success" })
   //You will now have an array of strings
   //[ 'One', 'Two', 'Three', 'Four' ]
   //return findOTP(data);

})


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
app.post('/postmob', async (req, res) => {
   details.mob = req.body.mob;
   const getall = await createRecords(req, res).catch(err => {
      res.status(500).json({
         status: false,
         "code": err.code,
         "message": err.message
      });
   })


   // obj.iterate = parseInt(req.body.iterate);
   // res.send({ status: "success" })
})


app.get('/startOrder1', async function (req, res) {
   io.emit('waychat', 'started');

})

app.get('/image', (req, res) => {
   const imageName = "example.jpg"
   const imagePath = path.join(__dirname, imageName);
   console.log(imagePath)
   fs.exists(imagePath, exists => {
      if (exists) res.sendFile(imagePath);
      else res.status(400).send('Error: Image does not exists');
   });
});

app.post('/testOrder', async function (req, res) {
   const delay = ms => new Promise(res => setTimeout(res, ms));
  const mob= req.body.mob;
  if(mob=='7979835402'){
     await delay(5000); 
     res.status(500).json({ status: true, message: "successfully placed" +mob})
  
  }

   res.send({ status: true, message: "successfully placed" +mob})
            
})
// endpoint to the p[rescribed slot if available
app.post('/startOrder', async function (req, res) {
   console.log("api place order hitted")

   details.mob= req.body.mob;

   async function getPic() {
      //comment headless
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage();
      await page.setViewport({
         width: 1100,
         height: 700,
      });
      await page.goto('https://mahashivarathri.org/en/rudraksha-diksha');
      io.emit('waychat', `Page Opens ,with ${details.mob}`);
      
      await page.screenshot({ path: 'example.jpg' });
      await page.waitFor(10000)
      await page.screenshot({ path: 'example.jpg' });
      await page.click(RECIEVE_FOR_FREE);
      await page.waitFor(2000)
      await page.screenshot({ path: 'example.jpg' });
      // res.write("foo");

      await page.type(FIRST_NAME, details.firstName, { delay: 100 });
      await page.type(EMAIL, details.email, { delay: 10 });
      await page.type(PINCODE, details.pin, { delay: 1000 });
      // res.write("bar");
      await page.screenshot({ path: 'example.jpg' });
      await page.type(HOUSE, details.house, { delay: 100 });
      await page.type(AREA, details.area, { delay: 100 });
      await page.type(LANDMARK, details.landmark, { delay: 100 });
      await page.type(CONTACT, details.mob, { delay: 1000 });
      await page.screenshot({ path: 'example.jpg' });

      await page.click(OUTSIDE_CLICK);
      await page.waitFor(3000)
      await page.screenshot({ path: 'example.jpg' });
      if (await page.$(ERROR_SELECTOR) !== null) {

         const element = await page.$(ERROR_SELECTOR);
         const text = await page.evaluate(element => element.textContent, element);
         if (text == "!First-time registrants only") {
            console.log("found")
            await page.screenshot({ path: 'example.jpg' });
            io.emit('waychat', `DUPLICATE USER`);
            const duplicateData = { key: 'isDuplicate', value: true, mob: details.mob }
            await updateRecords(duplicateData, res);
            await browser.close();
            res.send({ status: false, message: "duplicate user" })
         }
         else {
            await page.click(AGREE_1);
            await page.waitFor(3000)
            await page.click(AGREE_2);
            await page.waitFor(3000)
            await page.click(CONFIRM_OTP);
            io.emit('waychat', `WAITING FOR OTP`);
            await page.screenshot({ path: 'example.jpg' });
            //
            await page.waitFor(30000)


            const otppage = await browser.newPage();
            await page.setViewport({
               width: 1100,
               height: 700,
            });
            await otppage.goto(`https://mhs-sms.com/view-sms/91${details.mob}`);
            await otppage.waitFor(10000)
            await otppage.keyboard.press("PageDown");
            await otppage.keyboard.press("PageDown");
            await otppage.screenshot({ path: 'example.jpg' });

            const data = await otppage.evaluate(() => {
               const tds = Array.from(document.querySelectorAll('table tr td'))
               const id = tds.filter((data, index) => index < 10)
               return id.map((td, index) => td.innerText)
            });

            //You will now have an array of strings
            //[ 'One', 'Two', 'Three', 'Four' ]
            const otpfrommhs= findOTP(data);
console.log("mhs",otpfrommhs)
            if(otpfrommhs){

               console.log("mhaas",otpfrommhs)     
            }else{
               
               const notarrived = { key: 'otpNotArrived', value: true, mob: details.mob }
           await updateRecords(notarrived, res);
           await otppage.waitFor(10000)
           await browser.close();
   //res.send({ status: false, message: "not OTP" })
            }

            details.otp= otpfrommhs
            await otppage.screenshot({ path: 'example.jpg' });
            await otppage.waitFor(2000)
            await otppage.close()

            await page.waitFor(20000)

            await page.screenshot({ path: 'example.jpg' });
            io.emit('waychat', `Entering Otp: ${details.otp}`);
            await page.type(CODEBOX_1, details.otp, { delay: 1000 });
            await page.click(VERIFY_OTP);
            await page.screenshot({ path: 'example.jpg' });
            await page.waitFor(10000)
            await page.screenshot({ path: 'example.jpg' });
            if (await page.$(INVALID_OTP) !== null) {

               const element = await page.$(INVALID_OTP);
               const text = await page.evaluate(element => element.textContent, element);
               console.log("invalid", text)

               if (text == "Invalid OTP.") {
                  io.emit('waychat', `WRONG OTP`);
                  await browser.close();
                  const wrongOTPENtered = { key: 'wrongOtp', value: true, mob: details.mob }
                  await updateRecords(wrongOTPENtered, res);
                  await browser.close();
                  res.send({ status: false, message: "Wrong OTP" })
               }
               else {
                  io.emit('waychat', `OTP Verified`);
                  await page.waitFor(5000)


                  await page.click(SKIP_SELECTOR);
                  const registered = { key: 'alreadyRegisted', value: true, mob: details.mob }
                  await updateRecords(registered, res);

                  await page.waitFor(3000)
                  // await page.screenshot({ path: 'example.png' });
                  //await page.waitFor(4000)
                  await browser.close();

                  io.emit('waychat', `SUCCESSFULY PLACED`);
                  res.send({ status: true, message: "successfully placed" })
               }

            }
            else {
               {
                  io.emit('waychat', `OTP Verified`);
                  await page.screenshot({ path: 'example.jpg' });
                  await page.waitFor(5000)
                  await page.click(SKIP_SELECTOR);
                  const registered = { key: 'alreadyRegisted', value: true, mob: details.mob }
                  await updateRecords(registered, res);
                  await page.screenshot({ path: 'example.jpg' });
                  await page.waitFor(3000)
                  await page.screenshot({ path: 'example.jpg' });
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



const ddd=async()=>{
   const registered = { key: 'someError', value: true, mob: details.mob }
      await updateRecords(registered, res);
}


   await getPic().catch((error) => {
      // await browser.close();
      //ddd();
      res.send({ status: false,mob: details.mob, message: "Some Error Occured" })

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

//Dastavez api

app.get('/test1', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getTrackingDetails(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.post('/validate-user-details', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await validateUserDetails(req, res).catch(err => {
      res.status(500).json({
         status: false,
         "code": err.code,
         "message": err.message
      });
   })
})
app.get('/get-created-files', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getCreatedFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/get-user-details', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getUserDetails(req, res).catch(err => {
      res.status(401).json({
         status: false,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/create-file', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await createFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/send-files', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await sendFiles(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/track-file', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getTrackingDetails(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/receive-file', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await receiveFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/send-received-files', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await sendReceivedFiles(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.get('/get-received-files', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getReceiveFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})


app.get('/get-dasboard-data', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getDashboardDetails(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})







http.listen(PORT, () => { console.log(`listening ${PORT}`) })
