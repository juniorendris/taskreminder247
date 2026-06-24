const cron = require('node-cron');
const {sendEmail,pool} = require('./database');

function taskReminder(){
cron.schedule('* * * * *',async ()=>{
const fastSearchCmd=`SELECT t.id,t.task_name,u.email FROM tasks t JOIN usersInfo u ON u.user_id=t.user_id WHERE  t.status='pending' AND t.reminder_time<=NOW() ORDER BY t.reminder_time ASC LIMIT 100`;
const updatestatusCmd=`UPDATE tasks SET status='completed' WHERE id=?`; 

try{
   const [tasks]=await pool.execute(fastSearchCmd);
   for(const task of tasks){
    await sendEmail(task.email,"Task Reminder",  `It is time to ${task.task_Name}`);
    await pool.execute(updatestatusCmd,[task.id]);
    console.log(`The Status column chnaged to completed where id=${task.id}`);
   }
}
catch(error){
    console.error(error.message);
}

});
}

module.exports=taskReminder;