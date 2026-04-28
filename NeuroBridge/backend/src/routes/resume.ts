import { Router } from 'express';
import Resume from '../models/Resume';

export const resumeRouter = Router();

// Save resume data
resumeRouter.post('/save', async (req, res) => {
  try {
    const { email, resumeData, template } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let resume = await Resume.findOne({ user_email: email });
    
    if (resume) {
      resume.data = resumeData;
      resume.template = template;
      resume.updated_at = new Date();
      await resume.save();
    } else {
      resume = new Resume({
        user_email: email,
        data: resumeData,
        template: template
      });
      await resume.save();
    }

    res.json({ message: 'Resume saved successfully', resume });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// Get resume data
resumeRouter.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const resume = await Resume.findOne({ user_email: email });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});
