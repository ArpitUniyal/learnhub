const express = require('express');
const { auth } = require('../middleware/auth');
const { Content, Pdf } = require('../models');

const router = express.Router();

// Get all content for a specific PDF
router.get('/pdf/:pdfId', auth, async (req, res) => {
  try {
    const { pdfId } = req.params;

    const pdf = await Pdf.findOne({
      where: {
        id: pdfId,
        userId: req.user.id
      }
    });

    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const contents = await Content.findAll({
      where: { pdfId },
      order: [['createdAt', 'DESC']]
    });

    res.json(contents);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Error fetching content' });
  }
});

// Get content by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{ model: Pdf, attributes: ['id', 'originalName'] }]
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Error fetching content' });
  }
});

// Update content
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const [updated] = await Content.update(
      { content },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const updatedContent = await Content.findByPk(req.params.id);
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Error updating content' });
  }
});

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Content.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Error deleting content' });
  }
});

module.exports = router;
