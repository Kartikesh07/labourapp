import json
import os

locales_dir = r"D:\Projects\labourapp\labourfrontend\src\locales"

translations = {
    "hi": {
        "common": {
            "oops": "उफ़!",
            "tryAgain": "फिर से प्रयास करें"
        },
        "errors": {
            "ERR_USER_NOT_FOUND": "उपयोगकर्ता नहीं मिला",
            "ERR_UNAUTHORIZED": "अनधिकृत पहुंच",
            "ERR_INVALID_TOKEN": "अमान्य या समाप्त टोकन",
            "ERR_AUTH_FAILED": "प्रमाणीकरण विफल रहा",
            "ERR_SERVER_ERROR": "आंतरिक सर्वर त्रुटि",
            "ERR_RATE_LIMIT": "बहुत सारे अनुरोध, कृपया बाद में पुनः प्रयास करें",
            "ERR_LOCATION_REQUIRED": "स्थान आवश्यक है",
            "ERR_SKILLS_REQUIRED": "श्रमिकों के लिए पेशा (कौशल) आवश्यक है",
            "DEFAULT": "एक त्रुटि हुई"
        },
        "messages": {
            "registrationSuccess": "उपयोगकर्ता सफलतापूर्वक पंजीकृत हो गया",
            "loginSuccess": "सफलतापूर्वक प्रवेश किया",
            "profileUpdated": "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
            "availabilityUpdated": "उपलब्धता सफलतापूर्वक अपडेट की गई!"
        },
        "settings": {
            "appLanguage": "ऐप की भाषा",
            "selectLanguage": "भाषा चुनें",
            "language": "भाषा"
        },
        "languages": {
            "en": "English",
            "hi": "हिन्दी (Hindi)",
            "mr": "मराठी (Marathi)",
            "kn": "ಕನ್ನಡ (Kannada)"
        },
        "navigation": {
            "jobs": "नौकरियां",
            "applications": "आवेदन",
            "profile": "प्रोफ़ाइल",
            "jobDetails": "नौकरी का विवरण",
            "employerProfile": "नियोक्ता प्रोफ़ाइल",
            "dashboard": "डैशबोर्ड",
            "discover": "खोजें",
            "myJobs": "मेरी नौकरियां",
            "postJob": "नौकरी पोस्ट करें",
            "applicants": "आवेदक",
            "workerProfile": "श्रमिक प्रोफ़ाइल"
        },
        "categories": {
            "CONSTRUCTION": "निर्माण",
            "PLUMBING": "प्लंबिंग",
            "ELECTRICAL": "इलेक्ट्रिकल",
            "PAINTING": "पेंटिंग",
            "OTHER": "अन्य"
        },
        "professions": {
            "CARPENTER": "बढ़ई",
            "PLUMBER": "प्लंबर",
            "ELECTRICIAN": "इलेक्ट्रीशियन",
            "PAINTER": "पेंटर",
            "MASON": "राजमिस्त्री",
            "LABOURER": "मजदूर",
            "OTHER": "अन्य"
        }
    },
    "mr": {
        "common": {
            "oops": "अरेरे!",
            "tryAgain": "पुन्हा प्रयत्न करा"
        },
        "errors": {
            "ERR_USER_NOT_FOUND": "वापरकर्ता आढळला नाही",
            "ERR_UNAUTHORIZED": "अनधिकृत प्रवेश",
            "ERR_INVALID_TOKEN": "अवैध किंवा कालबाह्य टोकन",
            "ERR_AUTH_FAILED": "प्रमाणीकरण अयशस्वी झाले",
            "ERR_SERVER_ERROR": "अंतर्गत सर्व्हर त्रुटी",
            "ERR_RATE_LIMIT": "खूप जास्त विनंत्या, कृपया नंतर पुन्हा प्रयत्न करा",
            "ERR_LOCATION_REQUIRED": "स्थान आवश्यक आहे",
            "ERR_SKILLS_REQUIRED": "कामगारांसाठी व्यवसाय (कौशल्ये) आवश्यक आहे",
            "DEFAULT": "एखादी त्रुटी आली"
        },
        "messages": {
            "registrationSuccess": "वापरकर्ता यशस्वीरित्या नोंदणीकृत झाला",
            "loginSuccess": "यशस्वीरित्या लॉग इन केले",
            "profileUpdated": "प्रोफाइल यशस्वीरित्या अद्यतनित केले!",
            "availabilityUpdated": "उपलब्धता यशस्वीरित्या अद्यतनित केली!"
        },
        "settings": {
            "appLanguage": "अॅपची भाषा",
            "selectLanguage": "भाषा निवडा",
            "language": "भाषा"
        },
        "languages": {
            "en": "English",
            "hi": "हिन्दी (Hindi)",
            "mr": "मराठी (Marathi)",
            "kn": "ಕನ್ನಡ (Kannada)"
        },
        "navigation": {
            "jobs": "नोकर्‍या",
            "applications": "अर्ज",
            "profile": "प्रोफाइल",
            "jobDetails": "नोकरीचा तपशील",
            "employerProfile": "नियोक्ता प्रोफाइल",
            "dashboard": "डॅशबोर्ड",
            "discover": "शोधा",
            "myJobs": "माझ्या नोकर्‍या",
            "postJob": "नोकरी पोस्ट करा",
            "applicants": "अर्जदार",
            "workerProfile": "कामगार प्रोफाइल"
        },
        "categories": {
            "CONSTRUCTION": "बांधकाम",
            "PLUMBING": "प्लंबिंग",
            "ELECTRICAL": "इलेक्ट्रिकल",
            "PAINTING": "पेंटिंग",
            "OTHER": "इतर"
        },
        "professions": {
            "CARPENTER": "सुतार",
            "PLUMBER": "प्लंबर",
            "ELECTRICIAN": "इलेक्ट्रिशियन",
            "PAINTER": "पेंटर",
            "MASON": "गवंडी",
            "LABOURER": "मजूर",
            "OTHER": "इतर"
        }
    },
    "kn": {
        "common": {
            "oops": "ಅಯ್ಯೋ!",
            "tryAgain": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ"
        },
        "errors": {
            "ERR_USER_NOT_FOUND": "ಬಳಕೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ",
            "ERR_UNAUTHORIZED": "ಅನಧಿಕೃತ ಪ್ರವೇಶ",
            "ERR_INVALID_TOKEN": "ಅಮಾನ್ಯ ಅಥವಾ ಅವಧಿ ಮೀರಿದ ಟೋಕನ್",
            "ERR_AUTH_FAILED": "ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ",
            "ERR_SERVER_ERROR": "ಆಂತರಿಕ ಸರ್ವರ್ ದೋಷ",
            "ERR_RATE_LIMIT": "ತುಂಬಾ ವಿನಂತಿಗಳು, ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
            "ERR_LOCATION_REQUIRED": "ಸ್ಥಳ ಅಗತ್ಯವಿದೆ",
            "ERR_SKILLS_REQUIRED": "ಕಾರ್ಮಿಕರಿಗೆ ವೃತ್ತಿ (ಕೌಶಲ್ಯ) ಅಗತ್ಯವಿದೆ",
            "DEFAULT": "ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ"
        },
        "messages": {
            "registrationSuccess": "ಬಳಕೆದಾರರ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ",
            "loginSuccess": "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ",
            "profileUpdated": "ಪ್ರೊಫೈಲ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
            "availabilityUpdated": "ಲಭ್ಯತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!"
        },
        "settings": {
            "appLanguage": "ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ",
            "selectLanguage": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
            "language": "ಭಾಷೆ"
        },
        "languages": {
            "en": "English",
            "hi": "हिन्दी (Hindi)",
            "mr": "मराठी (Marathi)",
            "kn": "ಕನ್ನಡ (Kannada)"
        },
        "navigation": {
            "jobs": "ಉದ್ಯೋಗಗಳು",
            "applications": "ಅರ್ಜಿಗಳು",
            "profile": "ಪ್ರೊಫೈಲ್",
            "jobDetails": "ಉದ್ಯೋಗದ ವಿವರಗಳು",
            "employerProfile": "ಉದ್ಯೋಗದಾತ ಪ್ರೊಫೈಲ್",
            "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
            "discover": "ಹುಡುಕಿ",
            "myJobs": "ನನ್ನ ಉದ್ಯೋಗಗಳು",
            "postJob": "ಉದ್ಯೋಗ ಪೋಸ್ಟ್ ಮಾಡಿ",
            "applicants": "ಅರ್ಜಿದಾರರು",
            "workerProfile": "ಕಾರ್ಮಿಕರ ಪ್ರೊಫೈಲ್"
        },
        "categories": {
            "CONSTRUCTION": "ನಿರ್ಮಾಣ",
            "PLUMBING": "ಪ್ಲಂಬಿಂಗ್",
            "ELECTRICAL": "ಎಲೆಕ್ಟ್ರಿಕಲ್",
            "PAINTING": "ಪೇಂಟಿಂಗ್",
            "OTHER": "ಇತರೆ"
        },
        "professions": {
            "CARPENTER": "ಬಡಗಿ",
            "PLUMBER": "ಪ್ಲಂಬರ್",
            "ELECTRICIAN": "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್",
            "PAINTER": "ಪೇಂಟರ್",
            "MASON": "ಗಾರೆ ಕೆಲಸದವನು",
            "LABOURER": "ಕಾರ್ಮಿಕ",
            "OTHER": "ಇತರೆ"
        }
    }
}

for lang, data in translations.items():
    file_path = os.path.join(locales_dir, f"{lang}.json")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = json.load(f)
        
    for k, v in data.items():
        if isinstance(v, dict):
            if k not in content:
                content[k] = {}
            for sub_k, sub_v in v.items():
                content[k][sub_k] = sub_v
        else:
            content[k] = v

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)

print("Patching complete!")
