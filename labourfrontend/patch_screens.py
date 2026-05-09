import os, re

files = [
    'src/screens/worker/JobDetailScreen.tsx',
    'src/screens/worker/MyApplicationsScreen.tsx',
    'src/screens/worker/EmployerPublicProfileScreen.tsx',
    'src/screens/employer/WorkerPublicProfileScreen.tsx',
    'src/screens/employer/CreateJobScreen.tsx',
    'src/screens/employer/MyJobsScreen.tsx',
    'src/screens/employer/ApplicantsScreen.tsx'
]

# Simple regex definitions to find components we need to translate
def patch_file(fpath):
    if not os.path.exists(fpath): return
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add import
    if 'useTranslation' not in content:
        content = re.sub(r'(import .*? from \'react\'[^\n]*\n)', r'\1import { useTranslation } from \'react-i18next\';\n', content)
    
    # 2. Add hook at the top of the component
    # We look for const Component: React.FC = () => {
    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(const \w+(?:Screen|Card): React\.FC[A-Za-z<>_, {}]* = \([^)]*\) => {)\n', r'\1\n  const { t } = useTranslation();\n', content)
    
    # Let's map strict text strings to translation keys manually based on patterns we know exist in these files.
    replacements = [
        # Job Detail
        (r'>Job Details<', r'>{t("jobDetail.title")}<'),
        (r'>About the Job<', r'>{t("jobDetail.aboutJob")}<'),
        (r'>Requirements<', r'>{t("jobDetail.requirements")}<'),
        (r'>Salary<', r'>{t("jobDetail.salary")}<'),
        (r'>Location<', r'>{t("jobDetail.location")}<'),
        (r'>Apply Now<', r'>{t("jobDetail.applyNow")}<'),
        (r'>Already Applied<', r'>{t("jobDetail.alreadyApplied")}<'),
        (r'>Employer Information<', r'>{t("jobDetail.employerInfo")}<'),
        (r'>Application Submitted!<', r'>{t("jobDetail.applySuccess")}<'),
        (r'placeholder="Optional message to employer"', r'placeholder={t("jobDetail.messagePlaceholder")}'),
        (r'placeholder="Optional Message"', r'placeholder={t("jobDetail.messagePlaceholder")}'),

        # My Applications
        (r'>My Applications<', r'>{t("myApplications.title")}<'),
        (r'>No Applications Yet<', r'>{t("myApplications.noApps")}<'),
        (r'"Start applying for jobs and they\'ll appear here"', r't("myApplications.noAppsSubtitle")'),
        (r'"No Applications Yet"', r't("myApplications.noApps")'),
        (r'>Loading\.\.\.<', r'>{t("myApplications.loading")}<'),
        (r'>Couldn\'t load applications<', r'>{t("myApplications.retry")}<'),
        (r'"Couldn\'t load applications"', r't("myApplications.retry")'),
        (r'>Your message:<', r'>{t("myApplications.message")}<'),
        (r'"Applied "', r't("myApplications.applied")'),

        # Worker Profile, Employer Profile
        (r'>Employer Profile<', r'>{t("employerProfile.title")}<'),
        (r'>Worker Profile<', r'>{t("workerProfile.title")}<'),
        (r'>Contact Worker<', r'>{t("workerProfile.contact")}<'),
        (r'>Contact Information<', r'>{t("employerProfile.contactInfo")}<'),
        (r'>Skills<', r'>{t("workerProfile.skills")}<'),
        (r'>Experience<', r'>{t("workerProfile.experience")}<'),
        (r'>Availability<', r'>{t("workerProfile.availability")}<'),
        (r'>No skills listed<', r'>{t("workerProfile.noSkills")}<'),
        (r'>No jobs posted yet<', r'>{t("employerProfile.noJobs")}<'),
        (r'"No jobs posted yet"', r't("employerProfile.noJobs")'),
        (r'>Member Since<', r'>{t("workerProfile.memberSince")}<'),
        (r'>About Company<', r'>{t("employerProfile.aboutCompany")}<'),

        # Post a Job
        (r'>Post a Job<', r'>{t("createJob.title")}<'),
        (r'>Job Title<', r'>{t("createJob.jobTitle")}<'),
        (r'>Job Description<', r'>{t("createJob.description")}<'),
        (r'>Category<', r'>{t("createJob.category")}<'),
        (r'>Job Type<', r'>{t("createJob.jobType")}<'),
        (r'>Salary Amount<', r'>{t("createJob.salaryAmount")}<'),
        (r'>Salary Period<', r'>{t("createJob.salaryPeriod")}<'),
        (r'>Submit<', r'>{t("createJob.submit")}<'),
        (r'>Post Job<', r'>{t("createJob.submit")}<'),
        (r'"Job Created Successfully!"', r't("createJob.success")'),
        
        # My Jobs
        (r'>My Jobs<', r'>{t("myJobs.title")}<'),
        (r'>Active<', r'>{t("myJobs.active")}<'),
        (r'>Closed<', r'>{t("myJobs.closed")}<'),
        (r'"No Jobs Found"', r't("myJobs.noJobs")'),
        (r'"You haven\'t posted any jobs yet"', r't("myJobs.noJobsSubtitle")'),
        (r'>You haven\'t posted any jobs yet<', r'>{t("myJobs.noJobsSubtitle")}<'),
        (r'>Create New Job<', r'>{t("myJobs.createJob")}<'),

        # Applicants
        (r'>Applicants<', r'>{t("applicants.title")}<'),
        (r'>Accept<', r'>{t("applicants.accept")}<'),
        (r'>Reject<', r'>{t("applicants.reject")}<'),
        (r'>Contact<', r'>{t("applicants.contact")}<'),
        (r'>No Applicants Yet<', r'>{t("applicants.noApplicants")}<'),
        (r'"No Applicants Yet"', r't("applicants.noApplicants")'),
        (r'"When workers apply, they\'ll appear here"', r't("applicants.noApplicantsSubtitle")'),
        (r'>When workers apply, they\'ll appear here<', r'>{t("applicants.noApplicantsSubtitle")}<'),
    ]
    
    for old, new in replacements:
        content = re.sub(old, new, content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    patch_file(f)

print('Screens updated')
