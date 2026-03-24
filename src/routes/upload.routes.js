const router = require('express').Router();
const upload = require('../middleware/upload.middleware');

// upload nhiều ảnh
router.post('/', upload.array('images', 10), (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get('host');

    // Map files to return full URL
    const urls = req.files.map(file => `${protocol}://${host}/uploads/${file.filename}`);

    res.json({
      images: urls,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;