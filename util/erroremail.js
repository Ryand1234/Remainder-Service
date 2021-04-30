const htmlContent = async(type, urgency) => {
    let content = `<html><body><h1>Error</h1><p>There is an Error occured which needs attention.</p><ul><li>Error type: ${type}</li><li>Urgency: ${urgency}</li></ul></body></html>`
    return content
}

module.exports = htmlContent