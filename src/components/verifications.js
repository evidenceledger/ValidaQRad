const CERT_OK = true
const INV_CERT_TYPE = "Invalid certificate type"

export function verifyHcert(hcert) {

    // The credential
    let payload = hcert[1];

    if (payload["certType"] == "v") {
        return verifyVaccinationCert(hcert)
    } else if (payload["certType"] == "t") {
        return verifyTestCert(hcert)
    } else if (payload["certType"] == "r") {
        return verifyRecoveryCert(hcert)
    }

    //It is an error if the credential is not of one of those types
    return INV_CERT_TYPE

}

function verifyVaccinationCert(hcert) {
    // The credential
    let payload = hcert[1];

    let doseNumber = payload["doseNumber"]
    let doseTotal = payload["doseTotal"]

    //Check if vaccination is not completed
    if (doseNumber < doseTotal) {
        return "Vaccination not completed."
    }

    let dateVaccination = Date.parse(payload["dateVaccination"])
    let dateOfBirth = Date.parse(payload["dateOfBirth"])
    let timeValidFrom = dateVaccination + 14*24*60*60*1000
    let timeValidationExpired = dateVaccination + 270*24*60*60*1000
    let time18Years = dateOfBirth + 18*365*24*60*60*1000 + 4*24*60*60*1000

    let timeNow = Date.now()
    
    //Check if vaccination is completed
    if(doseNumber== doseTotal && (doseTotal==1 || doseTotal==2)) {
        //Check if last dose was taken more than 14 days before.
        if(timeNow >= timeValidFrom) {
            //Check if last dose was taken more than 270 days at is more than 18 years old.
            if(timeNow > timeValidationExpired && timeNow >= time18Years){
                return "Certificate is expired"
            }
            return CERT_OK
        }
        return "Certificate is not yet valid as vaccination is too recent." 
    }

    return CERT_OK
}

function verifyTestCert(hcert) {
    // The credential
    let payload = hcert[1];

    // The time when the sample was taken
    let timeSample = Date.parse(payload["timeSample"])
    let timeNow = Date.now()

    // The test is valid for 72 hours
    let validityTime = 72*60*60*1000

    // But only 12 hours if is a TAR
    if (payload["typeTest"] === "LP217198-3") {
        validityTime = 12*60*60*1000      
    }

    // The time until the test is valid
    let timeUntil = timeSample + validityTime

    if (timeNow > timeUntil) {
        return "Certificate is expired."
    }

    return CERT_OK
}

function verifyRecoveryCert(hcert) {
    // The credential
    let payload = hcert[1];

    let dateUntil = Date.parse(payload["dateUntil"])

    // The test is also valid the day that expires
    let validityTime = 24*60*60*1000

    //The time until the test is valid
    let timeUntil = dateUntil + validityTime

    let dateNow = Date.now()
    if (dateNow > timeUntil) {
        return "Certificate is expired."
    }

    return CERT_OK
}
