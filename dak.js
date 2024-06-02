var admin = require("firebase-admin");

var serviceAccount = require("./creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db=admin.firestore();

var dakDB=db.collection("DAK_LIST");
var userDB=db.collection("User_list");


const updateDakFile = async (req, res) => {
    // const client = await pool.connect();
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const dakdata=req.body.dakData;
        const dakJson={
            centrakDak:dakdata.centrakDak,
            dak_title:dakdata.dak_title,
            dak_details:dakdata.dak_details,
            sender:dakdata.sender,
            senderId:dakdata.senderId,
            receiver:dakdata.receiver,
            modifiedBy: dakdata.curentUser,
            last_updated_date: currentTime
        };
    
        const response=await dakDB.doc(dakdata.book.toString()).update(dakJson);
        res.status(201).json({ status: true, message: 'Dak updated successfully', headerText: 'Dak Update'});
      
       

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}


const addComment = async (req, res) => {
    // const client = await pool.connect();
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const dakdata=req.body.dakData;
        const userref=await dakDB.doc(dakdata.book.toString()).get();
        let extData=userref.data().comments;
        const commjson={ addedby: dakdata.curentUser, comment:dakdata.comment, updatedOn: currentTime}
        extData.push(commjson)
        
        const response=await dakDB.doc(dakdata.book.toString()).update({comments: extData});
        res.status(201).json({ status: true, message: 'comment added successfully', headerText: 'Dak comment' });

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}


const deleteDakFile = async (req, res) => {
    // const client = await pool.connect();
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const bookNo= req.body.book;
        const response=await dakDB.doc(bookNo.toLocaleString()).delete()
        res.status(201).json({ status: true, message: 'Dak deleted successfully', headerText: 'Dak Deleted' });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}


const addDakFile = async (req, res) => {
    // const client = await pool.connect();
    try {
        
    const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const dakdata=req.body.dakData;
    const dakJson={
        book:dakdata.book,
        centrakDak:dakdata.centrakDak,
        dak_title:dakdata.dak_title,
        dak_details:dakdata.dak_details,
        sender:dakdata.sender,
        senderId:dakdata.senderId,
        receiver:dakdata.receiver,
        comments:[{ addedby: dakdata.curentUser, comment:dakdata.comments, updatedOn: currentTime}],
        addedBy: dakdata.curentUser,
        last_updated_date: currentTime, date: dakdata.date
    };

    const response=await dakDB.doc(dakdata.book.toString()).set(dakJson)
    res.status(201).json({ status: true, message: 'Dak added successfully', headerText: 'Dak Added' });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}


const getAllDakFile = async (req, res) => {
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const response=dakDB;
        const resp= await response.get();
        let resarr=[];
        resp.forEach(doc=>{
            resarr.push(doc.data())
        })
        res.status(201).json({ status: true ,data:resarr });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}




let byPassUrls = [
    '/validate-user-details',
    // '/get-dasboard-data',
    '/signUpUser'
]
const securityToken= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ';

const validateUserDet = async (req, res) => {

    const id = req.body.username;
    const password = req.body.password;
    try {
        const userref=await userDB.doc(id.toString()).get();
        let userData=userref.data();
        if (userData) {

            if (userData.status == 'Approved') {

                if (userData.isActive) {

                    if (userData.password == password) {
                        delete userData.password;
                        res.status(201).json({ status: true, message: 'Successfully Logged In', token: `${securityToken}${userData.userId}`, headerText: 'Login Success',  data: userData});
                    } else {
                        res.status(201).json({ status: false, message: 'Wrong Password', headerText: 'Login Error' });
                    }
                }
                else {
                    res.status(201).json({ status: false, message: 'Your Id is Inactive', headerText: 'Contact your Supervisor' });
                }
            } else if (userData.status == 'Created') {
                res.status(201).json({ status: false, message: 'Your Id is pending for Approval', headerText: 'Contact your Supervisor' });
            }
            else if (userData.status == 'Rejected') {
                res.status(201).json({ status: false, message: 'Your Id is Rejected by your Supervisor', headerText: 'Contact your Supervisor' });
            }
        } else {
            res.status(201).json({ status: false, message: 'User doesn\'t exist', headerText: 'Login Error'});
        }

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}

const authenticateUser = async (req, res, next) => {

    try {
        if (byPassUrls.includes(req.url)) {
            next();
        } else {

            const token = req.get('token');
            const userId = req.headers?.user;
            
            if (token && userId && typeof token == 'string' && typeof userId == 'string' && token.includes(securityToken)) {

                let u_id = token.slice(35,token.length); 
                console.log("uid",u_id)
                const userref=await userDB.doc(u_id).get();
                let userData=userref.data();
                if (userData) {
                    
                    if (userData.isActive) {
                        next();
                    } else {
                        res.status(401).json({ status: false, message: 'User is inactive' });
                    }
                }
                else {
                    res.status(401).json({ status: false, message: 'User doesnot found' });
                }
            }
            else {
                res.status(401).json({ status: false, message: `Invalid token`, headerText: 'Invalid token' });
            }
        }


    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        
    }
}



module.exports = {
    addDakFile,getAllDakFile,updateDakFile,deleteDakFile,addComment, authenticateUser, validateUserDet
};