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
        const { u_id, role, department, status, name, is_active } = req.body;
        // if (ftsId.includes('FTS')) {
        // const fts_id = parseInt(ftsId.split('FTS')[1])

        const loginDataQuery = `UPDATE logincred SET role= $1, department=$2, status=$3 , is_active=$4 where u_id=$5`
        let results = await client.query(loginDataQuery, [role, department, status, is_active, u_id]);
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
        const { u_id, role, department, status, name, is_active } = req.body;
        // if (ftsId.includes('FTS')) {
        // const fts_id = parseInt(ftsId.split('FTS')[1])
        const loginDataQuery = `UPDATE logincred SET  status=$1 where u_id=$2`
        let results = await client.query(loginDataQuery, [status, u_id]);
      
         res.status(201).json({ status: true, message: `${status} details for ${name}` });

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
        let getRoleQuery = 'select u_id, user_name, name, role, department, is_active from logincred Where u_id != $1 and  status!= $2'
        let results = await client.query(loginDataQuery, [user_id]);
        if (results.rows.length) {
            const currentUser = results.rows[0];
            if (currentUser.role == 'Director') {
                let credData = await client.query(getRoleQuery, [user_id, 'Rejected']);
                res.status(201).json({ status: true, message: 'Manage role data are', data: credData.rows });
            } else {
                getRoleQuery = getRoleQuery + ` and department=$3 and role!=('Director' || 'Supervisor')`;
                let credDataForSupervisor = await client.query(getRoleQuery, [user_id ,'Rejected', currentUser.department]);
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
        let getRoleQuery = 'select u_id, user_name, name, role, department, status from logincred Where u_id != $1'
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
        const { user_id } = req.query;

        const loginDataQuery = `select role, department from logincred where u_id=$1`
        let getRoleQuery = 'select u_id, user_name, name, role, department, status from logincred Where u_id != $1'
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












module.exports = {
    getManageRoles, updateManageRoles ,approveUser, getAllUserDetails
};