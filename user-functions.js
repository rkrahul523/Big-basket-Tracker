const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'rkrah523',
    host: 'shopdb-instance.cpbnl5mbaeef.ap-northeast-1.rds.amazonaws.com',
    database: 'shopdb',
    password: 'Silicon123#',
    port: 5432,
});


const updateManageRoles = async (req, res) => {
    const client = await pool.connect();
    try {
        const { u_id, role, department, name, is_active } = req.body;
        // if (ftsId.includes('FTS')) {
        // const fts_id = parseInt(ftsId.split('FTS')[1])

        const loginDataQuery = `UPDATE logincred SET role= $1, department=$2, is_active=$3 where u_id=$4`
        let results = await client.query(loginDataQuery, [role, department, is_active, u_id]);
        res.status(201).json({ status: true, message: `Updated details for ${name}` });

    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }


}


const approveUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const { u_id, role, department, status, name, is_active, user_id } = req.body;
        // if (ftsId.includes('FTS')) {
        // const fts_id = parseInt(ftsId.split('FTS')[1])
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

        if (status == 'Approved') {
            const loginDataQuery = `UPDATE logincred SET  status=$1, is_active= $2 where u_id=$3`
            let results = await client.query(loginDataQuery, [status, true, u_id]);
            res.status(201).json({ status: true, message: `${status} details for ${name}` });

        } else if (status == 'Rejected') {
            const loginDataQuery = `UPDATE logincred SET  status=$1, is_active= $2 where u_id=$3`
            let results = await client.query(loginDataQuery, [status, false, u_id]);
            res.status(201).json({ status: true, message: `${status} details for ${name}` });
        } else if (status == 'Deleted') {
            const delUser = `_${user_id}_${currentTime}`;
            const loginDataQuery = `UPDATE logincred SET  status=$1, is_active= $2 ,user_name=concat(user_name,'${delUser}')  where u_id=$3`
            let results = await client.query(loginDataQuery, [status, false, u_id]);
            res.status(201).json({ status: true, message: `${status} details for ${name}` });
        } else {
            res.status(201).json({ status: true, message: `Not a valid action` });
        }


    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }


}


const getManageRoles = async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id } = req.query;
        // if (ftsId.includes('FTS')) {
        // const fts_id = parseInt(ftsId.split('FTS')[1])

        const loginDataQuery = `select role, department from logincred where u_id=$1`
        let getRoleQuery = 'select u_id, user_name, name, role, department, is_active from logincred Where u_id != $1 and  status= $2 '
        let results = await client.query(loginDataQuery, [user_id]);
        if (results.rows.length) {
            const currentUser = results.rows[0];
            if (currentUser.role == 'Director') {
                let credData = await client.query(getRoleQuery, [user_id, 'Approved']);
                res.status(201).json({ status: true, message: 'Manage role data are', data: credData.rows });
            } else {
                getRoleQuery = getRoleQuery + ` and department=$3 and role!='Director' and role!=('Supervisor')`;
                let credDataForSupervisor = await client.query(getRoleQuery, [user_id, 'Approved', currentUser.department]);
                res.status(201).json({ status: true, message: 'Manage role data are', data: credDataForSupervisor.rows });
            }
        } else {
            //  const createUpdated = await updateTracking({ fts_id }, 'Created')
            res.status(201).json({ status: false, message: `User doesnot exist` });
        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}
const getAllUserDetails = async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id } = req.query;
        // if (ftsId.includes('FTS')) {
        // const fts_id = parseInt(ftsId.split('FTS')[1])

        const loginDataQuery = `select role, department from logincred where u_id=$1`
        let getRoleQuery = "select u_id, user_name, name, role, department, status from logincred Where u_id != $1 and status !='Deleted'";
        let results = await client.query(loginDataQuery, [user_id]);
        if (results.rows.length) {
            const currentUser = results.rows[0];
            if (currentUser.role == 'Director') {
                let credData = await client.query(getRoleQuery, [user_id]);
                res.status(201).json({ status: true, message: 'Get all user  data are', data: credData.rows });
            } else if (currentUser.role == 'Supervisor') {
                getRoleQuery = getRoleQuery + ` and department=$2 and role!=('Director')`;
                let credDataForSupervisor = await client.query(getRoleQuery, [user_id, currentUser.department]);
                res.status(201).json({ status: true, message: 'Get all user  data are', data: credDataForSupervisor.rows });
            }

        } else {
            //  const createUpdated = await updateTracking({ fts_id }, 'Created')
            res.status(201).json({ status: false, message: `User doesnot exist` });
        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}


const signUpUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, password, department, name } = req.body;
        if (username && password && department && name) {
            const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            const signupQuery = `INSERT INTO logincred  (user_name, name, password,department, role , status , last_updated)
            VALUES ($1, $2, $3 ,$4 ,$5, $6, $7) `
            let signupQueryResults = await client.query(signupQuery, [username, name, password, department, 'Staff', 'Created' , currentTime]);
            res.status(201).json({ status: true, message: 'User registered successfully', headerText: 'Contact you Supersvisor' });
        } else {
            res.status(201).json({ status: false, message: `Enter valid details`, headerText: 'Invalid Details' });
        }
    } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release();
    }
}

let byPassUrls = [
    '/validate-user-details',
    // '/get-dasboard-data',
    '/signUpUser'
]


const isAuthenticatedUser = async (req, res, next) => {
    const client = await pool.connect();

    try {
        if (byPassUrls.includes(req.url)) {
            next();
        } else {

            const token = req.get('token');
            const userId = req.headers?.user;
            if (token && userId && typeof token == 'string' && typeof userId == 'string') {

                const u_id = parseInt(token.slice(-1));
                const query = `SELECT name, is_active , status  FROM logincred  WHERE u_id=$1`;
                let results = await client.query(query, [u_id]);
                if (results.rows.length) {
                    const userData = results.rows[0];
                    if (userData.is_active) {
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
        client.release();
    }
}





module.exports = {
    isAuthenticatedUser, signUpUser, getManageRoles, updateManageRoles, approveUser, getAllUserDetails
};