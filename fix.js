const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/jobs.controller.ts','utf8');
c = c.replace(/message: 'Employer jobs fetched successfully',[\s\S]*?data\s*\S*\s*}\);/m, 
message: 'Employer jobs fetched successfully',
        data: data?.map((job) => ({ ...job, employer_profiles: job.profiles?.employer_profiles || null }))
      }););
fs.writeFileSync('backend/src/controllers/jobs.controller.ts', c);
