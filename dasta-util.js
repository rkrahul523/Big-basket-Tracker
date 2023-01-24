const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'rkrah523',
    host: 'shopdb-instance.cpbnl5mbaeef.ap-northeast-1.rds.amazonaws.com',
    database: 'shopdb',
    password: 'Silicon123#',
    port: 5432,
});


const validateUserDetails = async (req, res) => {
    const name = req.body.username;
    const password = req.body.password;

    const client = await pool.connect();
    try {
        const query = `SELECT u_id,password FROM logincred  WHERE user_name=$1`;
        let results = await client.query(query, [name.toLowerCase()]);
        if (results.rows.length) {
            if (results.rows[0].password == password) {
                res.status(201).json({ status: true, message: 'Login successful', token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ${results.rows[0].u_id}` });
            } else {
                res.status(201).json({ status: false, message: 'Wrong Password' });
            }
        } else {
            res.status(201).json({ status: false, message: 'User doesn\'t exist' });
        }

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}




const getUserDetails = async (req, res) => {
    const token = req.body.token;
    // added for additional security;
    const u_id = parseInt(token.slice(-1));
    const client = await pool.connect();
    try {
        const username = req.body.username.toLowerCase();

        const query = `SELECT u_id, name, department, user_name FROM public.logincred  WHERE u_id=$1`;
        let results = await client.query(query, [u_id]);
        if (results.rows.length) {
            if (username == results.rows[0].user_name) {
                res.status(201).json({ status: true, message: 'User details found', data: results.rows[0] });
            } else {
                res.status(401).json({ status: false, message: 'Malforged Details' });
            }
        }
        else {
            res.status(401).json({ status: false, message: 'User doesnot found' });
        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}




const updateTracking = async (data, action) => {  /// Sent, Received, Closed
    const { fts_id, comments, u_id, sent_to, sent_date } = data;
    const client = await pool.connect();
    try {
        const query = `SELECT data FROM public.track_file_details where fts_id= $1`;
        const isPresent = `SELECT creation_date, created_by,sent_date, sent_to, comments, file_title FROM public.created_file_details where fts_id= $1`

        let results = await client.query(query, [fts_id]);


        const userQuery = `SELECT name FROM public.logincred  WHERE u_id=$1`;

        if (results.rows.length) {
            let previousrecords = results.rows[0].data;
           // console.log("previous data", JSON.stringify(previousrecords))

            //let newSentResults = await client.query(isPresent, [fts_id]);

            if (action == 'Sent' || action == 'Received') {
                // const fetchedCreateFile = newSentResults.rows[0];
                let userDetails = await client.query(userQuery, [u_id]);

                const sortedOrder = previousrecords.sort((a, b) => b.order - a.order);
                let lastOrder = sortedOrder[0].order;
                const newtrackData = {
                    status: action,
                    updatedon: sent_date,
                    updatedby: u_id,
                    name: userDetails.rows[0].name,
                    //filetitle: fetchedCreateFile.file_title,
                    comments: comments,
                    remarks: '',
                    order: ++lastOrder,
                    action_department: action == 'Sent' ? sent_to : ''
                }
                previousrecords.push(newtrackData)
               // console.log("data to insert", JSON.stringify(previousrecords))

                const insertQueryToTrack = `UPDATE public.track_file_details
                SET data='${JSON.stringify(previousrecords)}' where fts_id=${fts_id}`
                let insertResultstoTrack = await client.query(insertQueryToTrack);
                return insertResultstoTrack
            } else {
                return previousrecords;
            }
        } else {

            let isPresentResults = await client.query(isPresent, [fts_id]);
            //  console.log('isPresentResults', JSON.stringify(isPresentResults.rows))

            if (isPresentResults.rows.length) {
                const filedetails = isPresentResults.rows[0];
                let userDetails = await client.query(userQuery, [filedetails.created_by]);
                const trackData = [{
                    status: 'Created',
                    updatedon: filedetails.creation_date,
                    updatedby: filedetails.created_by,
                    comments: filedetails.comments,
                    filetitle: filedetails.file_title,
                    name: userDetails.rows[0].name,
                    remarks: '',
                    order: 1,
                    action_department: ''
                }]
                const insertQuery = `INSERT INTO public.track_file_details(
                fts_id, data) VALUES ($1, $2)`
                let insertResults = await client.query(insertQuery, [fts_id, JSON.stringify(trackData)]);
                const updatedData = await client.query(query, [fts_id])


                return { status: true, message: 'Fts id found with tracking data', data: updatedData.rows }
            } else {
                return { status: false, message: 'No Fts Id Found' };
            }
        }

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}



const getTrackingDetails = async (req, res) => {
    const client = await pool.connect();
    try {
        const ftsId = req.body.fts_id;
        if (ftsId.includes('FTS')) {
            const fts_id = parseInt(ftsId.split('FTS')[1])
            const query = `SELECT * FROM public.track_file_details where fts_id= $1`
            let results = await client.query(query, [fts_id]);
            if (results.rows.length) {
                res.status(201).json({ status: true, message: 'Fts id found with tracking data', data: results.rows });
            } else {
                const createUpdated = await updateTracking({ fts_id }, 'Created')
                res.status(201).json(createUpdated);
            }
        }
        else {
            res.status(201).json({ status: false, message: 'FTS Id  is Invalid' });

        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }


}



const createFile = async (req, res) => {

    const { file_title, document_type, priority, subject_area, file_station, user_id, comments } = req.body;
    const client = await pool.connect();
    try {
        const query = `INSERT INTO public.created_file_details(
            file_title, docket, file_status, document_type, priority, subject_area, file_station, creation_date, created_by, comments) VALUES ($1, $2, $3 ,$4 ,$5, $6, $7, $8, $9, $10)`
        let results = await client.query(query
            , [file_title, 2023, 'Created', document_type, priority, subject_area, file_station, new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }), user_id, comments]);
        res.status(201).json({ status: true, message: 'File Created' });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}


const getCreatedFile = async (req, res) => {

    const { user_id } = req.query;
    const client = await pool.connect();

    try {
        const query = `SELECT concat('FTS', fts_id) as fts_id , file_title,concat('NITP/', docket) as  docket, file_status, document_type, priority, subject_area, file_station, creation_date, sent_date,sent_to   from created_file_details where created_by=${user_id}`
        let results = await client.query(query)
        //console.log(JSON.stringify(results))
        res.status(201).json({ status: true, message: 'File Created', data: results.rows });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}



const receiveFile = async (req, res) => {

    const { fts_id, user_id } = req.body;


    const client = await pool.connect();
    try {

        const ftsId = parseInt(fts_id.split('FTS')[1]);
        const query = `SELECT data FROM public.track_file_details where fts_id= $1`;
        let results = await client.query(query, [ftsId]);
        const userQuery = `SELECT name,department FROM public.logincred  WHERE u_id=$1`;
        let userDetails = await client.query(userQuery, [user_id]);

        if (results.rows.length && userDetails.rows.length) {
            let previousrecords = results.rows[0].data;
            let fetchedUserData = userDetails.rows[0]
            const sortedOrder = previousrecords.sort((a, b) => b.order - a.order);

            if (sortedOrder[0].status == 'Sent' && sortedOrder[0].action_department == fetchedUserData.department) {

                /* create a row in received_file_details */

                const insertCreatedQuery = `INSERT INTO received_file_details (fts_id,file_title, docket, file_status, document_type, priority, subject_area,
                     file_station, received_date, received_by)
                 SELECT  fts_id,file_title, docket, $1, document_type, priority, subject_area, file_station, $2, $3
                  FROM created_file_details
                        WHERE fts_id=${ftsId}`;
                const receivedDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                let insertCreatedQueryResult = await client.query(insertCreatedQuery, ['Received', receivedDate, user_id]);

                /* update file_status in created_file_details as Operational*/

                const updatequery = `UPDATE created_file_details 
                SET file_status= $1  WHERE fts_id=${ftsId}`;
                let updatequeryresults = await client.query(updatequery
                    , ['Operational']);
                /* update tracking data*/
                const sentData = {
                    fts_id: ftsId,
                    comments: '',
                    u_id: user_id,
                    sent_to: '',
                    sent_date: receivedDate
                }
                const createUpdatedby = await updateTracking(sentData, 'Received')
                res.status(201).json({ status: true, message: `${fts_id} received successfully` });



            } else {
                res.status(201).json({ status: false, message: `You are not authorised to receive ${fts_id}` });
            }
        }

        else {
            res.status(201).json({ status: false, message: `${fts_id} doesnot exist` });
        }


    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}



const sendFiles = async (req, res) => {


    const { file_info, u_id } = req.body;


    const client = await pool.connect();
    try {

        const executeAllQuery = async () => {
            for (info of file_info) {
                const ftsId = parseInt(info.fts_id.split('FTS')[1]);
                // console.log("ftsid",ftsId)
                const query = `UPDATE created_file_details 
                   SET file_status= $1 ,sent_date= $2, sent_to= $3  WHERE fts_id=${ftsId}`;
                const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                let results = await client.query(query
                    , ['Sent', currentTime, info.sent_to]);
                // console.log("ftsbbbid",results)
                const sentData = {
                    fts_id: ftsId,
                    comments: info.comments,
                    u_id: u_id,
                    sent_to: info.sent_to,
                    sent_date: currentTime
                }
               // console.log("sent data", JSON.stringify(sentData))


                const createUpdated = await updateTracking(sentData, 'Sent')

            }
            return { status: true, message: 'All queries were sent' };
        };

        const result = await executeAllQuery();

        res.status(201).json(result);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}



const getReceiveFile = async (req, res) => {

    const { user_id } = req.query;


    const client = await pool.connect();
    try {
        const query = `SELECT concat('FTS', fts_id) as fts_id,
         file_title,
         concat('NITP/', docket) as  docket,
         file_status, document_type, priority, subject_area,
          file_station, received_date, received_by, sent_to,
           sent_date,
            receive_id
         FROM public.received_file_details where received_by= $1`;
        let results = await client.query(query, [user_id]);

        if (results.rows.length) {

            const fetchedData = results.rows;
            res.status(201).json({ status: true, message: `Received files successfully`, data:fetchedData });

        } else {
            res.status(201).json({ status: false, message: `No Records Found` });

        }

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}


const sendReceivedFiles = async (req, res) => {


    const { file_info, u_id } = req.body;


    const client = await pool.connect();
    try {

        const executeAllQuery1 = async () => {
            for (info of file_info) {
                const ftsId = parseInt(info.fts_id.split('FTS')[1]);
                //console.log("ftsid",ftsId)
                const query = `UPDATE received_file_details 
                   SET file_status= $1 ,sent_date= $2, sent_to= $3  WHERE receive_id=${info.receive_id}`;
                const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                let results = await client.query(query
                    , ['Sent', currentTime, info.sent_to]);
              //  console.log("ftsbbbid",results)
                const sentData = {
                    fts_id: ftsId,
                    comments: info.comments,
                    u_id: u_id,
                    sent_to: info.sent_to,
                    sent_date: currentTime
                }


                const createUpdated = await updateTracking(sentData, 'Sent')

            }
            return { status: true, message: 'All queries were sent' };
        };

        const result = await executeAllQuery1();

        res.status(201).json(result);

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}







module.exports = {
    createFile, validateUserDetails, getTrackingDetails, getCreatedFile, getUserDetails, sendFiles, receiveFile,sendReceivedFiles, getReceiveFile
};