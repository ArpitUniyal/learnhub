const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');

// @route   GET api/user/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('learningProgress.topic', 'title subject');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('username', 'Username is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, preferences } = req.body;

    try {
      // Check if email is already taken by another user
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ msg: 'Email is already in use' });
        }
      }

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Update user fields
      user.username = username || user.username;
      user.email = email || user.email;
      
      if (preferences) {
        user.preferences = {
          ...user.preferences,
          ...preferences
        };
      }

      await user.save();

      // Return user data without password
      const userData = user.toObject();
      delete userData.password;
      
      res.json({
        msg: 'Profile updated successfully',
        user: userData
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route   GET api/user/progress
// @desc    Get user's learning progress
// @access  Private
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('learningProgress')
      .populate({
        path: 'learningProgress.topic',
        select: 'title subject difficulty',
        populate: {
          path: 'subject',
          select: 'name'
        }
      })
      .populate({
        path: 'learningProgress.completedQuizzes',
        select: 'title score maxScore percentage completedAt',
        options: { sort: { completedAt: -1 }, limit: 5 }
      });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Calculate overall progress statistics
    const progress = user.learningProgress || [];
    const totalTopics = progress.length;
    const completedTopics = progress.filter(topic => topic.completedQuizzes && topic.completedQuizzes.length > 0).length;
    const totalQuizzes = progress.reduce((sum, topic) => sum + (topic.completedQuizzes?.length || 0), 0);
    const averageScore = progress.length > 0 
      ? progress.reduce((sum, topic) => sum + (topic.score || 0), 0) / progress.length
      : 0;
    
    // Group by subject
    const bySubject = {};
    progress.forEach(topic => {
      const subject = topic.topic?.subject || 'Other';
      if (!bySubject[subject]) {
        bySubject[subject] = {
          total: 0,
          completed: 0,
          averageScore: 0,
          topics: []
        };
      }
      
      bySubject[subject].total += 1;
      if (topic.completedQuizzes && topic.completedQuizzes.length > 0) {
        bySubject[subject].completed += 1;
      }
      bySubject[subject].averageScore = (bySubject[subject].averageScore + (topic.score || 0)) / 2;
      bySubject[subject].topics.push({
        id: topic.topic?._id,
        title: topic.topic?.title,
        score: topic.score,
        lastAccessed: topic.lastAccessed,
        completed: topic.completedQuizzes?.length > 0
      });
    });
    
    // Get recent activity
    const recentActivity = [];
    progress.forEach(topic => {
      if (topic.completedQuizzes && topic.completedQuizzes.length > 0) {
        topic.completedQuizzes.forEach(quiz => {
          recentActivity.push({
            type: 'quiz',
            topic: topic.topic?.title,
            score: quiz.score,
            maxScore: quiz.maxScore,
            percentage: quiz.percentage,
            date: quiz.completedAt
          });
        });
      }
      
      if (topic.lastAccessed) {
        recentActivity.push({
          type: 'topic_view',
          topic: topic.topic?.title,
          date: topic.lastAccessed
        });
      }
    });
    
    // Sort by date, most recent first
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      statistics: {
        totalTopics,
        completedTopics,
        completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
        totalQuizzes,
        averageScore: Math.round(averageScore * 10) / 10
      },
      bySubject,
      recentActivity: recentActivity.slice(0, 10) // Return only the 10 most recent activities
    });
  } catch (err) {
    console.error('Error fetching learning progress:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/user/progress/:topicId
// @desc    Update user's progress for a specific topic
// @access  Private
router.post('/progress/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { score, quizId } = req.body;
    
    // Find the topic
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ msg: 'Topic not found' });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find or create progress entry for this topic
    let progressIndex = user.learningProgress.findIndex(
      p => p.topic.toString() === topicId
    );
    
    if (progressIndex === -1) {
      // Create new progress entry
      user.learningProgress.push({
        topic: topicId,
        score: 0,
        completedQuizzes: []
      });
      progressIndex = user.learningProgress.length - 1;
    }
    
    // Update progress
    const progress = user.learningProgress[progressIndex];
    
    // Update score (average of all quiz attempts)
    if (typeof score === 'number') {
      const currentScore = progress.score || 0;
      const attemptCount = progress.completedQuizzes.length;
      progress.score = ((currentScore * attemptCount) + score) / (attemptCount + 1);
    }
    
    // Add quiz to completed quizzes if provided
    if (quizId) {
      const quiz = await Quiz.findById(quizId);
      if (quiz) {
        progress.completedQuizzes.push({
          quiz: quizId,
          score: score || 0,
          maxScore: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
          percentage: Math.round((score / quiz.questions.length) * 100) || 0,
          completedAt: new Date()
        });
      }
    }
    
    // Update last accessed time
    progress.lastAccessed = new Date();
    
    await user.save();
    
    res.json({
      msg: 'Progress updated successfully',
      progress: {
        topic: topic._id,
        score: progress.score,
        completedQuizzes: progress.completedQuizzes.length,
        lastAccessed: progress.lastAccessed
      }
    });
  } catch (err) {
    console.error('Error updating progress:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Topic not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/user/quizzes
// @desc    Get user's quiz history
// @access  Private
router.get('/quizzes', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const user = await User.findById(req.user.id)
      .select('learningProgress')
      .populate({
        path: 'learningProgress.completedQuizzes.quiz',
        select: 'title description topic',
        populate: {
          path: 'topic',
          select: 'title subject'
        }
      });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Flatten all completed quizzes from all topics
    let allQuizzes = [];
    user.learningProgress.forEach(topicProgress => {
      if (topicProgress.completedQuizzes && topicProgress.completedQuizzes.length > 0) {
        topicProgress.completedQuizzes.forEach(quiz => {
          allQuizzes.push({
            id: quiz._id,
            quiz: quiz.quiz,
            score: quiz.score,
            maxScore: quiz.maxScore,
            percentage: quiz.percentage,
            completedAt: quiz.completedAt,
            topic: topicProgress.topic
          });
        });
      }
    });
    
    // Sort by completion date, most recent first
    allQuizzes.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedQuizzes = allQuizzes.slice(startIndex, endIndex);
    
    res.json({
      total: allQuizzes.length,
      page: parseInt(page, 10),
      totalPages: Math.ceil(allQuizzes.length / limit),
      quizzes: paginatedQuizzes
    });
  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
