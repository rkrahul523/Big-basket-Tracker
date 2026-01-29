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
const http = require('http').createServer(app);
const pool = new Pool({
   user: 'rkrah523',
   host: 'shopdb-instance.cpbnl5mbaeef.ap-northeast-1.rds.amazonaws.com',
   database: 'shopdb',
   password: 'Silicon523#',
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
       getLastComment,
       deleteFile,
       sendReceivedFiles,
       checkFileToReceived,
       getDashboardDetails,
       receiveFile} = require('./dasta-util.js')
const { getManageRoles ,
    updateManageRoles,
     approveUser,
      getAllUserDetails,
      signUpUser,
      isAuthenticatedUser

} = require('./user-functions.js')

const { deleteLeave, getAllLeaveData, addDakFile ,addLeave,
   getAllDakFile,getALLTimeTable,
   updateDakFile,deleteDakFile,addComment, authenticateUser, validateUserDet, addTimeTable
} = require('./dak.js')




// app.use(cors({credentials: true, origin: 'http://localhost:4200'}));

app.use(async (req, res, next) =>{
   //Enabling CORS

   res.set('Access-Control-Allow-Credentials', 'true')
   // res.set('Access-Control-Allow-Origin', '*')
   res.set('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, POST')
   res.set('Access-Control-Allow-Headers', '*')
 
   let allowedOrigins = [
      "https://sasta-bazaar.onrender.com","https://bbtracker.onrender.com",
      "http://localhost:4200",
      "https://dastaavez.onrender.com",
      "https://suvidha-605w.onrender.com",
      "https://suvida.netlify.app"
]
   let origin = req.headers.origin;
   if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
   }

   // res.json({status: 503})

   // res.status(503).json({
   //    status: false,
   //    error: true,
   //    // "code": err.code,
   //    // "message": err.message
   // });
   // var err = new Error('Not Found');
   // err.status = 404;
 
   next();
   // const getall = await isAuthenticatedUser(req, res, next).catch(err => {
   //    console.log("error catched", err)
   //    res.status(401).json({
   //       status: false,
   //       error: true,
   //       "code": err.code,
   //       "message": err.message
   //    });
   // })



//   next();
});

 
 // error handlers
 


 

//  app.use(cors({credentials: false, origin: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());





//chat

// let http = require('http');
// let server = http.Server(app);




app.get('*',async (req,res,next)=>{

   const getall = await authenticateUser(req, res, next).catch(err => {
         console.log("error catched", err)
         res.status(401).json({
            status: false,
            error: true,
            "code": err.code,
            "message": err.message
         });
      })

  

})
app.post('*',async (req,res,next)=>{

   const getall = await authenticateUser(req, res, next).catch(err => {
         console.log("error catched", err)
         res.status(401).json({
            status: false,
            error: true,
            "code": err.code,
            "message": err.message
         });
      })
})


//Dastavez api

app.post('/add-time-table', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await addTimeTable(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.post('/addDak', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await addDakFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/validateLogin', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await validateUserDet(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.post('/addComment', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await addComment(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.post('/deleteDak', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await deleteDakFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.post('/updatedDak', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await updateDakFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.get('/getAllDak', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getAllDakFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.get('/healthz', async (req, res) => {
   try {
     // Optional: Add critical checks like DB connectivity here
     // e.g., await checkDatabaseConnection();
     
     res.status(200).json({
       status: 'ok',
       code: 'healthy',
       message: 'Service running fine'
     });
   } catch (error) {
     // Fail fast on errors to signal unhealthy state
     res.status(500).json({ status: 'error', message: 'Health check failed' });
   }
 });
 
app.get('/get-all-time-table', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getALLTimeTable(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/addLeave', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await addLeave(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/deleteLeave', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await deleteLeave(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error:true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/getAllLeaveData', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getAllLeaveData(req, res).catch(err => {
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
app.get('/get-manage-roles', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getManageRoles(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/update-manage-roles', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await updateManageRoles(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.get('/get-all-user-details', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getAllUserDetails(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/approve-users', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await approveUser(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/check-file-to-receive', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await checkFileToReceived(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})

app.post('/get-last-comment', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await getLastComment(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/delete-file', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await deleteFile(req, res).catch(err => {
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   })
})
app.post('/signUpUser', async (req, res) => {
  // details.mob = req.body.mob;
   const getall = await signUpUser(req, res).catch(err => {
      if(err && err.code== "23505"){
         res.status(201).json({ status: false, message: 'User already Exists for this Email', headerText: 'Sign Up Failed!!'}); 
      }else{
      res.status(500).json({
         status: false,
         error: true,
         "code": err.code,
         "message": err.message
      });
   }
   })
})


// localhost:5000/get-manage-roles?user_id=10




http.listen(PORT, () => { console.log(`listening ${PORT}`) })
