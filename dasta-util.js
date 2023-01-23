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
        let results = await client.query(query, [name]);
        if (results.rows.length) {
            if (results.rows[0].password == password) {
                res.status(201).json({ status: true, message: 'Login successful', token:`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ${results.rows[0].u_id}` });
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
    const u_id= parseInt(token.slice(-1));
    const client = await pool.connect();
    try {
        const username= req.body.username; 

        const query = `SELECT u_id, name, department, user_name FROM public.logincred  WHERE u_id=$1`;
        let results = await client.query(query, [u_id]);
        if (results.rows.length) {
            if(username== results.rows[0].user_name){
                res.status(201).json({ status: true, message: 'User details found', data: results.rows[0] });
            }else{
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
    const { fts_id, comments } = data;
    const client = await pool.connect();
    try {
        const query = `SELECT data FROM public.track_file_details where fts_id= $1`;
        const isPresent = `SELECT creation_date, created_by,sent_date, sent_to, comments FROM public.created_file_details where fts_id= $1`

        let results = await client.query(query, [fts_id]);


        const userQuery = `SELECT name FROM public.logincred  WHERE u_id=$1`;

        if (results.rows.length) {
            let previousrecords = results.rows[0];
            let newSentResults = await client.query(isPresent, [fts_id]);
           
            if (action == 'Sent') {
                const fetchedCreateFile = newSentResults.rows[0];
                let userDetails = await client.query(userQuery, [fetchedCreateFile.created_by]);

                const sortedOrder = previousrecords.sort((a, b) => b.order - a.order);
                const lastOrder = sortedOrder[0].order;
                const newtrackData = {
                    status: 'Sent',
                    updatedon: fetchedCreateFile.sent_date,
                    updatedby: fetchedCreateFile.created_by,
                    name: userDetails.rows[0].name,
                    comments: comments,
                    remarks: '',
                    order: lastOrder++,
                    action_department: fetchedCreateFile.sent_to
                }
                previousrecords.push(newtrackData)

                const insertQueryToTrack = `UPDATE public.track_file_details
                SET data=${JSON.stringify(previousrecords)}`
                let insertResultstoTrack = await client.query(insertQueryToTrack);
                return insertResultstoTrack
            } else {
                return previousrecods;
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
                    name: userDetails.rows[0].name,
                    remarks: '',
                    order: 1,
                    action_department: ''
                }]
                const insertQuery = `INSERT INTO public.track_file_details(
                fts_id, data) VALUES ($1, $2)`
                let insertResults = await client.query(insertQuery, [fts_id, JSON.stringify(trackData)]);
                const updatedData = await client.query(query, [fts_id])
            

                 return   { status: true, message: 'Fts id found with tracking data', data: updatedData.rows}
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
        if(ftsId.includes('FTS')){
        const fts_id = parseInt(ftsId.split('FTS')[1])
        const query = `SELECT * FROM public.track_file_details where fts_id= $1`
        let results = await client.query(query, [fts_id]);
        if (results.rows.length) {
            res.status(201).json({ status: true, message: 'Fts id found with tracking data', data: results.rows });
        } else {
            const createUpdated = await updateTracking({ fts_id }, 'Created')
            res.status(201).json(createUpdated);
        }}
        else{
            res.status(201).json({ status: false, message: 'FTS Id  is Invalid' });
       
        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }


}



const createFile = async (req, res) => {

    const { file_title, document_type, priority, subject_area, file_station, user_id , comments} = req.body;
    const client = await pool.connect();
    try {
        const query = `INSERT INTO public.created_file_details(
            file_title, docket, file_status, document_type, priority, subject_area, file_station, creation_date, created_by, comments) VALUES ($1, $2, $3 ,$4 ,$5, $6, $7, $8, $9, $10)`
        let results = await client.query(query
            , [file_title, 2023, 'Created', document_type, priority, subject_area, file_station, new Date().toString(), user_id, comments ]);
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

        const ftsId = parseInt(fts_id.split('FTS')[1]);
    const client = await pool.connect();
    try {
        const isPresent = `SELECT creation_date, created_by,sent_date, sent_to, comments FROM public.created_file_details where fts_id= $1`
        let createdFileDetails = await client.query(isPresent, [ftsId]);

        if(createdFileDetails.rows.length){
            const fileDetails= createdFileDetails.rows[0];
             
            if(fileDetails.sent_date && fileDetails.sent_to){

            }else{
                res.status(201).json({ status: false, message: `You are not authorised to receive the file` })
            }



        }else{
            res.status(201).json({ status: false, message: `${fts_id} doesnot exist` });
        }



        const query = `INSERT INTO public.created_file_details(
            file_title, docket, file_status, document_type, priority, subject_area, file_station, creation_date, created_by) VALUES ($1, $2, $3)`
        let results = await client.query(query
            , [file_title, 2023, 'Created', document_type, priority, subject_area, file_station, new Date().toString(), created_by]);
        res.status(201).json({ status: true, message: 'File Created' });
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}


module.exports = {
    createFile, validateUserDetails, getTrackingDetails, getCreatedFile , getUserDetails
};