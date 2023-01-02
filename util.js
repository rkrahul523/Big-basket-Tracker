const findOTP = (d) => {
    const otpText = 'Rudraksha Diksha'
    const filteredtext = d.filter(x => x.includes(otpText))
    if (filteredtext.length) {
        const otp = filteredtext[0].split(' ').map(d => parseInt(d)).filter(x => x)
        return otp[0].toString();
    } else {
        return ''
    }

}


module.exports = {
    findOTP
};