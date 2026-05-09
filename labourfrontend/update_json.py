import os, json
en_data = {
  'jobDetail': {'title': 'Job Details', 'aboutJob': 'About the Job', 'requirements': 'Requirements', 'salary': 'Salary', 'location': 'Location', 'applyNow': 'Apply Now', 'alreadyApplied': 'Already Applied', 'employerInfo': 'Employer Information', 'messagePlaceholder': 'Optional message to employer', 'applySuccess': 'Application Submitted!'},
  'myApplications': {'title': 'My Applications', 'loading': 'Loading...', 'noApps': 'No Applications Yet', 'noAppsSubtitle': 'Start applying for jobs and they will appear here', 'retry': 'Could not load applications', 'message': 'Your message:', 'applied': 'Applied'},
  'employerProfile': {'title': 'Employer Profile', 'totalJobs': 'Total Jobs', 'activeJobs': 'Active Jobs', 'memberSince': 'Member Since', 'aboutCompany': 'About Company', 'contactInfo': 'Contact Information', 'noJobs': 'No jobs posted yet'},
  'workerProfile': {'title': 'Worker Profile', 'contact': 'Contact Worker', 'skills': 'Skills', 'experience': 'Experience', 'availability': 'Availability', 'noSkills': 'No skills listed', 'memberSince': 'Member Since'},
  'createJob': {'title': 'Post a Job', 'jobTitle': 'Job Title', 'description': 'Job Description', 'category': 'Category', 'jobType': 'Job Type', 'salaryAmount': 'Salary Amount', 'salaryPeriod': 'Salary Period', 'location': 'Location', 'submit': 'Post Job', 'success': 'Job Created Successfully!'},
  'myJobs': {'title': 'My Jobs', 'active': 'Active', 'closed': 'Closed', 'noJobs': 'No Jobs Found', 'noJobsSubtitle': 'You have not posted any jobs yet', 'createJob': 'Create New Job'},
  'applicants': {'title': 'Applicants', 'accept': 'Accept', 'reject': 'Reject', 'contact': 'Contact', 'noApplicants': 'No Applicants Yet', 'noApplicantsSubtitle': 'When workers apply, they will appear here'}
}

for lang in ['en.json', 'hi.json', 'mr.json', 'kn.json']:
    path = f'src/locales/'+lang
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for k, v in en_data.items():
        data[k] = v
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
print('JSONs updated')
