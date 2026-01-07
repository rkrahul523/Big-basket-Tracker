var admin = require("firebase-admin");

var serviceAccount = require("./creds.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();

var dakDB = db.collection("DAK_LIST");
var userDB = db.collection("User_list");
var leaveDB = db.collection("leaveDetails");

var coursesDB = db.collection("Courses");


const addTimeTable = async (req, res) => {
    // const client = await pool.connect();
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const timetableData = req.body.timeData;
        const userref = await coursesDB.doc(timetableData.course.toString()).get();
        let dbdata = userref.data()
        //    console.log(dbdata)
        let extData = []
        const filter = `${timetableData.day}` in dbdata ? dbdata[`${timetableData.day}`].filter(v => (v.startTime == timetableData.startTime || v.endTime == timetableData.endTime)) : [];
        if (filter.length) {
            res.status(500).json({ status: false, message: 'already present', headerText: 'added timetable' });

        } else {
            if (`${timetableData.day}` in dbdata) {
                extData = dbdata[`${timetableData.day}`];
                extData.push(timetableData);
            } else {
                extData = [timetableData]
            }

            const response = await coursesDB.doc(timetableData.course.toString()).update({ [`${timetableData.day}`]: extData });
            res.status(201).json({ status: true, message: 'timetable added successfully', headerText: 'added timetable' });
        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}

const addLeave = async (req, res) => {
    const department = req.body.department;
    const typeOfLeave = req.body.leaveType;
    const empId = req.body.id;
  
    try {
      const docSnap = await leaveDB.doc(department).collection('1').doc(String(empId)).get();
  
      if (!docSnap.exists) {
        // Create new document with initial structure
        const initialJson = {
          EmployeeName: req.body.EmployeeName,
          id: req.body.id,
          CL: [], EL: [], HPL: [], VL: [], UL: [], RH: [], DL: []
        };
        
        await leaveDB.doc(department).collection('1').doc(String(empId)).set(initialJson);
        const newDocSnap = await leaveDB.doc(department).collection('1').doc(String(empId)).get();
        let existingData = newDocSnap.data();
        
        // ✅ ADD THIS: Ensure typeOfLeave array exists
        if (!(typeOfLeave in existingData)) {
          existingData[typeOfLeave] = [];
        }
        
        // Create new leave entry
        const newLeave = {
          dateFrom: req.body.dateFrom,
          dateTo: req.body.dateTo,
          day: req.body.day,
          leaveId: req.body.leaveId,
          ...(typeOfLeave === "CL" && { isHalfDay: req.body.isHalfDay })
        };
  
        if (isLeaveDateOverlap(existingData[typeOfLeave], { 
          dateFrom: req.body.dateFrom, 
          dateTo: req.body.dateTo 
        })) {
          return res.status(500).json({ 
            status: false, 
            message: 'Leave date overlap detected' 
          });
        }
  
        await leaveDB.doc(department).collection('1').doc(String(empId)).update({
          [typeOfLeave]: [...existingData[typeOfLeave], newLeave]
        });
  
        return res.status(201).json({ 
          status: true, 
          message: 'Leave added successfully' 
        });
  
      } else {
        // Document exists - update it
        let existingData = docSnap.data();
        
        // ✅ ADD THIS: Ensure typeOfLeave array exists
        if (!(typeOfLeave in existingData)) {
          existingData[typeOfLeave] = [];
        }
  
        const newLeave = {
          dateFrom: req.body.dateFrom,
          dateTo: req.body.dateTo,
          day: req.body.day,
          leaveId: req.body.leaveId,
          ...(typeOfLeave === "CL" && { isHalfDay: req.body.isHalfDay })
        };
  
        if (isLeaveDateOverlap(existingData[typeOfLeave], { 
          dateFrom: req.body.dateFrom, 
          dateTo: req.body.dateTo 
        })) {
          return res.status(500).json({ 
            status: false, 
            message: 'Leave date overlap detected' 
          });
        }
  
        await leaveDB.doc(department).collection('1').doc(String(empId)).update({
          [typeOfLeave]: [...existingData[typeOfLeave], newLeave]
        });
  
        return res.status(201).json({ 
          status: true, 
          message: 'Leave added successfully' 
        });
      }
  
    } catch (error) {
      console.error('Error adding leave:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Internal server error' 
      });
    }
  };
  

const getAllLeaveData = async (req, res) => {
     const department=req.body.department;
    try {
       
            const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            
            const allEmployees = [];
            const allLeaves = [];
            let empId = 1;
            const maxEmpId = 28;
            
            console.log(`🚀 Loading ALL leaves from ${department}`);
            
            // ✅ Loop through empIds until gap found
            while (empId <= maxEmpId) {
              const docSnap = await leaveDB.doc(department).collection('1').doc(String(empId)).get();
              
              if (!docSnap.exists) {    
                console.log(`❌ Gap at empId ${empId} → STOPPING`);
                break;
              } 
              
              // ✅ Employee exists - accumulate data
              const existingData = docSnap.data();
            //   allEmployees.push({
            //     empId: String(empId),
            //     EmployeeName: existingData.EmployeeName,
            //     id: existingData.id
            //   });
            allEmployees.push(existingData)
              empId++;
            }
  console.log('✅ ALL nested data:', allEmployees);
        res.status(201).json({ status: true, data: allEmployees });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}

const deleteLeave = async (req, res) =>{
    try {

        // {
        //     employee: "Dr. K.K. Singh"
        //     fromDate : "02-12-2025"
        //     id : 2
        //     leaveId: "17668440628402"
        //     toDate : "03-12-2025"
        //     type : "EL"
        //   }
      const department = req.body.department; // 'FFT'
      const empId = req.body.id;              // employee ID
      const leaveId = req.body.leaveId;       // unique leaveId to delete
      const typeOfLeave = req.body.type; // 'CL', 'EL', etc.
  
      // Step 1: Check if document exists
      const docSnap = await leaveDB.doc(department).collection('1').doc(String(empId)).get();
      
      if (!docSnap.exists) {
        return res.status(404).json({ error: 'Employee document not found' });
      }
  
      const existingData = docSnap.data();
      
      // Step 2: Find and remove the specific leave by leaveId
      if (existingData[typeOfLeave]) {
        // Filter out the leave with matching leaveId
        existingData[typeOfLeave] = existingData[typeOfLeave].filter((leave) => 
          leave.leaveId !== leaveId
        );
        
        // Step 3: Update the document with filtered array
        await leaveDB.doc(department).collection('1').doc(String(empId)).update(existingData);
        
        console.log(`✅ Deleted leave ${leaveId} from ${typeOfLeave} for employee ${empId}`);
        return res.status(200).json({ 
            status: true,
          message: 'Leave deleted successfully',
          deletedLeaveId: leaveId 
        });

        
      } else {
        return res.status(404).json({status: false, error: `No ${typeOfLeave} leaves found for employee` });
      }
  
    } catch (error) {
      console.error('❌ Delete leave error:', error);
      res.status(500).json({ status: false ,error: 'Failed to delete leave', details: error.message });
    }
  }
  

const getALLTimeTable = async (req, res) => {
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const response = coursesDB;
        const resp = await response.get();
        let resarr = [];
        resp.forEach(doc => {
            // console.log(doc.id)
            resarr.push({ [doc.id]: doc.data() })
        })
        res.status(201).json({ status: true, data: resarr });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}

const updateDakFile = async (req, res) => {
    // const client = await pool.connect();
    try {
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const dakdata = req.body.dakData;
        const dakJson = {
            centrakDak: dakdata.centrakDak,
            dak_title: dakdata.dak_title,
            dak_details: dakdata.dak_details,
            sender: dakdata.sender,
            senderId: dakdata.senderId,
            receiver: dakdata.receiver,
            modifiedBy: dakdata.curentUser,
            last_updated_date: currentTime
        };

        const response = await dakDB.doc(dakdata.book.toString()).update(dakJson);
        res.status(201).json({ status: true, message: 'Dak updated successfully', headerText: 'Dak Update' });



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
        const dakdata = req.body.dakData;
        const userref = await dakDB.doc(dakdata.book.toString()).get();
        let extData = userref.data().comments;
        const commjson = { addedby: dakdata.curentUser, comment: dakdata.comment, updatedOn: currentTime }
        extData.push(commjson)

        const response = await dakDB.doc(dakdata.book.toString()).update({ comments: extData });
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
        const bookNo = req.body.book;
        const response = await dakDB.doc(bookNo.toLocaleString()).delete()
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
        const dakdata = req.body.dakData;
        const dakJson = {
            book: dakdata.book,
            centrakDak: dakdata.centrakDak,
            dak_title: dakdata.dak_title,
            dak_details: dakdata.dak_details,
            sender: dakdata.sender,
            senderId: dakdata.senderId,
            receiver: dakdata.receiver,
            comments: [{ addedby: dakdata.curentUser, comment: dakdata.comments, updatedOn: currentTime }],
            addedBy: dakdata.curentUser,
            last_updated_date: currentTime, date: dakdata.date
        };

        const response = await dakDB.doc(dakdata.book.toString()).set(dakJson)
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
        const response = dakDB;
        const resp = await response.get();


        let resarr = [];
        resp.forEach(doc => {

            resarr.push(doc.data())
        })
        res.status(201).json({ status: true, data: resarr });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        // 
    }


}




let byPassUrls = [
    '/validate-user-details',
    '/add-time-table',
    // '/get-dasboard-data',
    // '/getAllLeaveData',
    // '/signUpUser',
    // '/addLeave',
    // '/deleteLeave',
    '/validateLogin',
    '/get-all-time-table'
]
const securityToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ';

const validateUserDet = async (req, res) => {

    const id = req.body.username;
    const password = req.body.password;
    try {
        const userref = await userDB.doc(id.toString()).get();
        let userData = userref.data();
        if (userData) {

            if (userData.status == 'Approved') {

                if (userData.isActive) {

                    if (userData.password == password) {
                        delete userData.password;
                        res.status(201).json({ status: true, message: 'Successfully Logged In', token: `${securityToken}${userData.userId}`, headerText: 'Login Success', data: userData });
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
            res.status(201).json({ status: false, message: 'User doesn\'t exist', headerText: 'Login Error' });
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

                let u_id = token.slice(35, token.length);
                console.log("uid", u_id)
                const userref = await userDB.doc(u_id).get();
                let userData = userref.data();
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



function isLeaveDateOverlap(leaves, checkDateRange) {
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(Number(year), Number(month) - 1, Number(day));
      };
      
      const checkFrom = parseDate(checkDateRange.dateFrom);
      const checkTo = parseDate(checkDateRange.dateTo);
      
      // Loop through each leave
      for (const leave of leaves) {
        const leaveFrom = parseDate(leave.dateFrom);
        const leaveTo = parseDate(leave.dateTo);
        
        // ✅ OVERLAP LOGIC: if ranges intersect
        if (checkFrom <= leaveTo && checkTo >= leaveFrom) {
          console.log(`✅ OVERLAP FOUND: ${leave.leaveId} (${leave.dateFrom} to ${leave.dateTo})`);
          return true;
        }
      }
      
      console.log('❌ No overlap found');
      return false;
  }


module.exports = {
    deleteLeave, getAllLeaveData,  addLeave, getALLTimeTable, addTimeTable, addDakFile, getAllDakFile, updateDakFile, deleteDakFile, addComment, authenticateUser, validateUserDet
};