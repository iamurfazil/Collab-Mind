function ok(res, data = {}, message = 'OK') {
  return res.status(200).json({ success: true, message, data });
}

function fail(res, statusCode = 400, message = 'Request failed') {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { ok, fail };
